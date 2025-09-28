import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, decodeEventLog, type Abi } from 'viem';
import { ActionManagerFactoryAbi } from '@/lib/abi/factory';

export async function GET(req: NextRequest) {
  const txHash = req.nextUrl.searchParams.get('tx');
  if (!txHash) return NextResponse.json({ ok: false, code: 'MISSING_TX' }, { status: 400 });
  const rpcUrl = process.env.WORLDCHAIN_RPC_URL as string;
  const chainId = Number(process.env.WORLDCHAIN_CHAIN_ID ?? 480);
  const client = createPublicClient({
    chain: { id: chainId, name: 'World Chain', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
    transport: http(rpcUrl),
  });

  const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  let manager: string | null = null;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: ActionManagerFactoryAbi as unknown as Abi, data: log.data, topics: log.topics });
      if (decoded.eventName === 'ActionRequestCreated' && decoded.args) {
        const argsUnknown = decoded.args as unknown;
        if (Array.isArray(argsUnknown)) manager = (argsUnknown[1] as string) ?? null;
        else manager = ((argsUnknown as Record<string, unknown>)['actionManager'] as string) ?? null;
        break;
      }
    } catch {
      // ignore
    }
  }

  if (!manager) return NextResponse.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, manager });
}


