import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getDb } from '@/lib/db/mongo';
import { createPublicClient, http } from 'viem';
import { ActionManagerAbi } from '@/lib/abi/manager';

type RequestDoc = {
  id: string;
  manager: string;
  title: string;
  description?: string;
  budgetToken: 'USDC' | 'WLD';
  budgetAmount: string;
  createdAt: number;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item = store.getRequest(id);
  if (!item) {
    try {
      const db = await getDb();
      const doc = (await db.collection('requests').findOne({ id })) as RequestDoc | null;
      if (doc) item = doc as unknown as typeof item;
    } catch {
      // ignore
    }
  }
  if (!item) return NextResponse.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 });
  // If we have a manager, augment with on-chain details
  let onchain: {
    status: number;
    details: unknown;
    econ: unknown;
    endingTimestamp: string;
    delegationToken?: `0x${string}`;
  } | null = null;
  if (item.manager && item.manager !== '0x0000000000000000000000000000000000000000') {
    try {
      const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
      const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
      const client = createPublicClient({
        chain: { id: chainId, name: 'World Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
        transport: http(rpcUrl),
      });
      const [status, details, econ, endingTs] = await Promise.all([
        client.readContract({ address: item.manager as `0x${string}`, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getStatus', args: [] }) as Promise<number>,
        client.readContract({ address: item.manager as `0x${string}`, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getActionDetails', args: [] }) as Promise<unknown>,
        client.readContract({ address: item.manager as `0x${string}`, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getEconomicParameters', args: [] }) as Promise<unknown>,
        client.readContract({ address: item.manager as `0x${string}`, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getEndingTimestamp', args: [] }) as Promise<bigint>,
      ]);
      // details: [requester, resolver, delegationToken, delegatedAmount, stakeToken, stakedAmount, status, endingTimestamp]
      const tuple = details as unknown as [
        string,
        string,
        `0x${string}`,
        bigint,
        `0x${string}`,
        bigint,
        number,
        bigint
      ];
      const safeDetails = {
        requester: tuple?.[0] ?? null,
        resolver: tuple?.[1] ?? null,
        delegationToken: tuple?.[2] ?? null,
        delegatedAmount: tuple?.[3] !== undefined ? String(tuple[3]) : null,
        stakeToken: tuple?.[4] ?? null,
        stakedAmount: tuple?.[5] !== undefined ? String(tuple[5]) : null,
      } as const;
      const delegationToken = safeDetails.delegationToken ?? undefined;
      onchain = {
        status,
        details: safeDetails,
        econ,
        endingTimestamp: endingTs ? endingTs.toString() : '0',
        delegationToken,
      };
    } catch {
      // swallow on-chain read errors for resilience
    }
  }
  return NextResponse.json({ ok: true, request: item, onchain });
}


