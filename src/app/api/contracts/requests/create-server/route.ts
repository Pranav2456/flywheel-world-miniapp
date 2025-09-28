import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createPublicClient, createWalletClient, http, decodeEventLog, type Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { FACTORY_ADDRESS } from '@/lib/abi/factory';

async function requireVerifiedCookie() {
  const cookieStore = await cookies();
  const v = cookieStore.get('fw_verified')?.value;
  if (v !== 'true') return NextResponse.json({ ok: false, code: 'NOT_VERIFIED' }, { status: 401 });
  return null;
}

export async function POST() {
  const guard = await requireVerifiedCookie();
  if (guard) return guard;

  const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
  const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);

  try {
    const safe = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/contracts/factory/safe-params`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ ok: false })) as { ok?: boolean; token?: `0x${string}`; delegatedTokenAmount?: string };
    if (!safe?.ok || !safe.token || !safe.delegatedTokenAmount) {
      return NextResponse.json({ ok: false, code: 'FACTORY_NOT_FUNDED' }, { status: 500 });
    }

    const pk = process.env.SERVER_WALLET_PRIVATE_KEY as `0x${string}` | undefined;
    if (!pk) return NextResponse.json({ ok: false, code: 'MISSING_SERVER_PK' }, { status: 500 });

    const account = privateKeyToAccount(pk);
    const chain = { id: chainId, name: 'World Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } };
    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    const wallet = createWalletClient({ account, chain, transport: http(rpcUrl) });

    const CreateActionRequestAbi = [
      {
        type: 'function',
        name: 'createActionRequest',
        stateMutability: 'nonpayable',
        inputs: [
          {
            name: '_actionRequest',
            type: 'tuple',
            components: [
              { name: 'requester', type: 'address' },
              { name: 'actionDescription', type: 'string' },
              { name: 'duration', type: 'uint256' },
              { name: 'gracePeriod', type: 'uint256' },
              { name: 'delegationToken', type: 'address' },
              { name: 'delegatedTokenAmount', type: 'uint256' },
              { name: 'stakeToken', type: 'address' },
              { name: 'stakeAmountBufferInBps', type: 'uint16' },
              { name: 'profitCommissionInBps', type: 'uint16' },
              { name: 'acceptableLossInBps', type: 'uint16' },
              { name: 'salt', type: 'bytes32' },
            ],
          },
        ],
        outputs: [{ name: '', type: 'address' }],
      },
      {
        type: 'event',
        name: 'ActionRequestCreated',
        inputs: [
          {
            name: 'actionRequest',
            type: 'tuple',
            indexed: true,
            components: [
              { name: 'requester', type: 'address' },
              { name: 'actionDescription', type: 'string' },
              { name: 'duration', type: 'uint256' },
              { name: 'gracePeriod', type: 'uint256' },
              { name: 'delegationToken', type: 'address' },
              { name: 'delegatedTokenAmount', type: 'uint256' },
              { name: 'stakeToken', type: 'address' },
              { name: 'stakeAmountBufferInBps', type: 'uint16' },
              { name: 'profitCommissionInBps', type: 'uint16' },
              { name: 'acceptableLossInBps', type: 'uint16' },
              { name: 'salt', type: 'bytes32' },
            ],
          },
          { name: 'actionManager', type: 'address', indexed: true },
        ],
        anonymous: false,
      },
    ] as const satisfies Abi;

    const salt = `0x${crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '')}` as `0x${string}`;
    const actionRequest = {
      requester: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      actionDescription: 'Demo mission',
      duration: BigInt(7 * 24 * 60 * 60),
      gracePeriod: BigInt(24 * 60 * 60),
      delegationToken: safe.token as `0x${string}`,
      delegatedTokenAmount: BigInt(safe.delegatedTokenAmount),
      stakeToken: safe.token as `0x${string}`,
      stakeAmountBufferInBps: 1000,
      profitCommissionInBps: 1000,
      acceptableLossInBps: 500,
      salt,
    };

    const hash = await wallet.writeContract({
      address: FACTORY_ADDRESS,
      abi: CreateActionRequestAbi,
      functionName: 'createActionRequest',
      args: [actionRequest],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    let manager: string | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: CreateActionRequestAbi, data: log.data, topics: log.topics });
        if (decoded.eventName === 'ActionRequestCreated' && decoded.args) {
          const argsUnknown = decoded.args as { [key: string]: unknown } | unknown[];
          if (Array.isArray(argsUnknown)) manager = (argsUnknown[1] as string) ?? null;
          else manager = ((argsUnknown as Record<string, unknown>)['actionManager'] as string) ?? null;
          break;
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ ok: true, txHash: hash, manager, token: safe.token, delegatedTokenAmount: safe.delegatedTokenAmount });
  } catch (err) {
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR', detail: (err as Error).message }, { status: 500 });
  }
}


