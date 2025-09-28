import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { ERC20Abi } from '@/lib/abi/erc20';
import { FACTORY_ADDRESS } from '@/lib/abi/factory';

export async function GET() {
  try {
    const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
    const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
    const client = createPublicClient({
      chain: { id: chainId, name: 'World Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
      transport: http(rpcUrl),
    });

    const usdc = (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '').toLowerCase();
    const wld = (process.env.NEXT_PUBLIC_WLD_ADDRESS ?? '').toLowerCase();
    const candidates = [usdc, wld].filter((x) => x && x.startsWith('0x')) as `0x${string}`[];

    let bestToken: `0x${string}` | null = null;
    let bestBalance = BigInt(0);
    for (const token of candidates) {
      try {
        const bal = (await client.readContract({ address: token, abi: ERC20Abi, functionName: 'balanceOf', args: [FACTORY_ADDRESS] })) as bigint;
        if (bal > bestBalance) {
          bestBalance = bal;
          bestToken = token;
        }
      } catch {
        // ignore token read errors
      }
    }

    if (!bestToken || bestBalance <= BigInt(1)) {
      return NextResponse.json({ ok: false, code: 'FACTORY_NOT_FUNDED', factory: FACTORY_ADDRESS });
    }

    // Factory transfers 2x delegated amount → choose amount <= balance/4 for safety
    const delegatedTokenAmount = bestBalance / BigInt(4);
    if (delegatedTokenAmount <= BigInt(0)) {
      return NextResponse.json({ ok: false, code: 'INSUFFICIENT_BALANCE', factory: FACTORY_ADDRESS });
    }

    return NextResponse.json({ ok: true, token: bestToken, delegatedTokenAmount: delegatedTokenAmount.toString() });
  } catch (err) {
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR', detail: (err as Error).message });
  }
}


