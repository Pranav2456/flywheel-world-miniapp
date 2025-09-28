import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/store';
import { getDb } from '@/lib/db/mongo';
import { createPublicClient, http } from 'viem';
import { ActionManagerAbi } from '@/lib/abi/manager';

async function requireVerifiedCookie() {
  const cookieStore = await cookies();
  const v = cookieStore.get('fw_verified')?.value;
  if (v !== 'true') {
    return NextResponse.json({ ok: false, code: 'NOT_VERIFIED' }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request, context: unknown) {
  const guard = await requireVerifiedCookie();
  if (guard) return guard;

  const { returnAmount } = await req.json();
  const { params } = context as { params: { id: string } };

  try {
    let manager: `0x${string}` | undefined = (store.getRequest(params.id)?.manager as `0x${string}` | undefined) ?? undefined;
    if (!manager) {
      try {
        const db = await getDb();
        const doc = (await db.collection('requests').findOne({ id: params.id })) as { manager?: string } | null;
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

    const [commissionBps, delegatedAmount, status, endingTs] = await Promise.all([
      client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getProfitCommissionBps', args: [] }) as Promise<number>,
      client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getDelegatedTokenAmount', args: [] }) as Promise<bigint>,
      client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getStatus', args: [] }) as Promise<number>,
      client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getEndingTimestamp', args: [] }) as Promise<bigint>,
    ]);

    if (status !== 1) {
      return NextResponse.json({ ok: false, code: 'INVALID_STATUS', status }, { status: 400 });
    }

    // Ensure chain time >= endingTimestamp
    const latestBlock = await client.getBlock({ blockTag: 'latest' });
    const nowTs = latestBlock.timestamp;
    if (nowTs < endingTs) {
      return NextResponse.json({ ok: false, code: 'NOT_ENDED', endingTimestamp: endingTs.toString(), now: nowTs.toString() }, { status: 400 });
    }

    const gross = BigInt(returnAmount ?? '0');
    const profit = gross > delegatedAmount ? gross - delegatedAmount : BigInt(0);
    const commission = (profit * BigInt(commissionBps)) / BigInt(10000);
    const requesterAmount = gross - commission;

    return NextResponse.json({
      ok: true,
      settlement: {
        gross: gross.toString(),
        commission: commission.toString(),
        requesterAmount: requesterAmount.toString(),
      },
      txHash: '0x' + '0'.repeat(64),
      requestId: params.id,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR', detail: (err as Error).message }, { status: 500 });
  }
}


