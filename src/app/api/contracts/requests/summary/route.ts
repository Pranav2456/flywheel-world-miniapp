import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getDb } from '@/lib/db/mongo';
import { createPublicClient, http } from 'viem';
import { ActionManagerAbi } from '@/lib/abi/manager';

export async function GET() {
  // Seed from memory, hydrate from Mongo if available
  let items = store.listRequests(200);
  try {
    const db = await getDb();
    const docs = (await db
      .collection('requests')
      .find({}, { limit: 200, sort: { createdAt: -1 } })
      .toArray()) as unknown[];
    if (docs?.length) items = docs as typeof items;
  } catch {
    // non-fatal
  }

  const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
  const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
  const client = createPublicClient({
    chain: {
      id: chainId,
      name: 'World Chain',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    },
    transport: http(rpcUrl),
  });

  const summaries = await Promise.all(
    items.map(async (r) => {
      const manager = r.manager as `0x${string}`;
      if (!manager || manager === '0x0000000000000000000000000000000000000000') {
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          manager: r.manager,
          ownerWalletAddress: (r as unknown as { ownerWalletAddress?: string }).ownerWalletAddress,
          status: null,
          requester: null,
          resolver: null,
          endingTimestamp: null,
        };
      }
      try {
        const [status, details, endingTs] = await Promise.all([
          client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getStatus', args: [] }) as Promise<number>,
          client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getActionDetails', args: [] }) as Promise<unknown>,
          client.readContract({ address: manager, abi: ActionManagerAbi as unknown as readonly [{ type: string }], functionName: 'getEndingTimestamp', args: [] }) as Promise<bigint>,
        ]);
        const tuple = details as unknown as [string, string];
        const [requester, resolver] = [tuple?.[0] as string, tuple?.[1] as string];
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          manager: r.manager,
          ownerWalletAddress: (r as unknown as { ownerWalletAddress?: string }).ownerWalletAddress,
          status,
          requester,
          resolver,
          endingTimestamp: endingTs.toString(),
        };
      } catch {
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          manager: r.manager,
          ownerWalletAddress: (r as unknown as { ownerWalletAddress?: string }).ownerWalletAddress,
          status: null,
          requester: null,
          resolver: null,
          endingTimestamp: null,
        };
      }
    })
  );

  return NextResponse.json({ ok: true, items: summaries });
}


