import { NextResponse } from 'next/server';
import { fetchPythUpdateDataREST } from '@/lib/pyth-rest';
import { cookies } from 'next/headers';
import { store } from '@/lib/store';
import { createPublicClient, http } from 'viem';
import { getDb } from '@/lib/db/mongo';
import { ActionManagerAbi } from '@/lib/abi/manager';
import { PythOracleAbi, PythCoreAbi } from '@/lib/abi/oracle';

async function requireVerifiedCookie() {
  const cookieStore = await cookies();
  const v = cookieStore.get('fw_verified')?.value;
  if (v !== 'true') {
    return NextResponse.json({ ok: false, code: 'NOT_VERIFIED' }, { status: 401 });
  }
  return null;
}

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await requireVerifiedCookie();
  if (guard) return guard;
  const { id } = await context.params;

  // We will determine the correct Pyth feed IDs by reading them from the on-chain oracle mapping

  // Compute stake amount and oracle update fee
  let manager: `0x${string}` | undefined = (store.getRequest(id)?.manager as `0x${string}` | undefined) ?? undefined;
  if (!manager) {
    try {
      const db = await getDb();
      const doc = (await db.collection('requests').findOne({ id })) as { manager?: string } | null;
      if (doc?.manager) manager = doc.manager as `0x${string}`;
    } catch {
      // ignore
    }
  }
  if (!manager || manager === '0x0000000000000000000000000000000000000000') {
    return NextResponse.json({ ok: false, code: 'NO_MANAGER' }, { status: 400 });
  }

  const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
  const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
  const client = createPublicClient({
    chain: { id: chainId, name: 'World Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
    transport: http(rpcUrl),
  });

  const [delegatedAmount, bufferBps, stakeToken, oracleAddr, delegationToken] = await Promise.all([
    client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getDelegatedTokenAmount', args: [] }) as Promise<bigint>,
    client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getStakeAmountBufferInBps', args: [] }) as Promise<number>,
    client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getStakeToken', args: [] }) as Promise<`0x${string}`>,
    client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getOracle', args: [] }) as Promise<`0x${string}`>,
    client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getDelegationToken', args: [] }) as Promise<`0x${string}`>,
  ]);

  // Resolve feed IDs from oracle to ensure correctness
  const [delegationFeedId, stakeFeedId] = await Promise.all([
    client.readContract({ address: oracleAddr, abi: PythOracleAbi as unknown as readonly [{ type: string }], functionName: 'getPriceFeedId', args: [delegationToken] }) as Promise<`0x${string}`>,
    client.readContract({ address: oracleAddr, abi: PythOracleAbi as unknown as readonly [{ type: string }], functionName: 'getPriceFeedId', args: [stakeToken] }) as Promise<`0x${string}`>,
  ]);
  const zero = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;
  const onchainIds = [delegationFeedId, stakeFeedId].filter((x) => x && x !== zero) as `0x${string}`[];
  const envIds = [process.env.PYTH_WLD_USD_ID, process.env.PYTH_USDC_USD_ID].filter(Boolean) as string[];
  const priceIds = Array.from(new Set([...onchainIds, ...envIds])) as `0x${string}`[];
  const priceUpdateDataRaw = await fetchPythUpdateDataREST(priceIds).catch(() => undefined);
  const updatesHex = Array.isArray(priceUpdateDataRaw)
    ? (priceUpdateDataRaw.map((u) => (u.startsWith('0x') ? (u as `0x${string}`) : (`0x${u}` as `0x${string}`))) as `0x${string}`[])
    : [];
  if (updatesHex.length === 0) {
    return NextResponse.json({ ok: false, code: 'NO_PYTH_UPDATES', ids: priceIds }, { status: 502 });
  }

  // Compute precise stake using the same logic as the contract via oracle simulation
  const pythCoreAddr = (await client.readContract({ address: oracleAddr, abi: PythOracleAbi as unknown as readonly [{ type: string }], functionName: 'getPyth', args: [] })) as `0x${string}`;
  const updateFeeWei = (await client.readContract({ address: pythCoreAddr, abi: PythCoreAbi as unknown as readonly [{ type: string }], functionName: 'getUpdateFee', args: [updatesHex] })) as bigint;

  const pricesSim = await client.simulateContract({
    address: oracleAddr,
    abi: PythOracleAbi as unknown as readonly [{ type: string }],
    functionName: 'getPrices',
    args: [updatesHex, [delegationToken, stakeToken] as [`0x${string}`, `0x${string}`]],
    value: updateFeeWei,
  });
  const pricesScaled = pricesSim.result as unknown as readonly [bigint, bigint];
  const priceDelegation = pricesScaled[0];
  const priceStake = pricesScaled[1];

  const stakedAmountNoBuffer = (delegatedAmount * priceStake) / priceDelegation;
  const stakeAmountBuffer = (stakedAmountNoBuffer * BigInt(bufferBps)) / BigInt(10000);
  const stakeAmount = stakedAmountNoBuffer + stakeAmountBuffer;

  return NextResponse.json({ ok: true, priceUpdateData: updatesHex, requestId: id, manager, stakeToken, stakeAmount: stakeAmount.toString(), updateFeeWei: updateFeeWei.toString() });
}


