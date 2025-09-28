'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { createRequest } from '@/lib/api/contracts';
import type { SupportedTokenSymbol } from '@/types/contracts';
import { useRouter } from 'next/navigation';
import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js';

export const CreateRequestForm = () => {
  const router = useRouter();
  const [title, setTitle] = useState('Morpho strategy');
  const [description, setDescription] = useState('');
  const [token, setToken] = useState<SupportedTokenSymbol>('USDC');
  const [amount, setAmount] = useState('100');
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      // Optional: show a visible payment to the server wallet before server-side creation
      const serverWallet = process.env.NEXT_PUBLIC_SERVER_WALLET_ADDRESS as `0x${string}` | undefined;
      if (serverWallet && MiniKit.isInstalled()) {
        try {
          const refRes = await fetch('/api/initiate-payment', { method: 'POST' });
          const refJson = (await refRes.json().catch(() => ({}))) as { id?: string };
          const reference = refJson?.id ?? crypto.randomUUID();
          const payPayload = {
            reference,
            to: serverWallet,
            tokens: [
              {
                symbol: Tokens.WLD,
                token_amount: tokenToDecimals(0.1, Tokens.WLD).toString(),
              },
            ],
            description: 'Flywheel: request creation processing',
          } as const;
          await MiniKit.commandsAsync.pay(payPayload as unknown as Parameters<typeof MiniKit.commandsAsync.pay>[0]);
        } catch (payErr) {
          // Non-fatal for hackathon; proceed to server-side creation
          console.warn('Payment step failed or skipped', payErr);
        }
      }

      const server = await fetch('/api/contracts/requests/create-server', { method: 'POST' })
        .then((r) => r.json())
        .catch(() => ({ ok: false })) as { ok?: boolean; txHash?: `0x${string}`; manager?: `0x${string}`; token?: string; delegatedTokenAmount?: string };
      if (!server?.ok) throw new Error('Server create failed');

      // Use the actual token chosen by the server for correct formatting/decimals
      const usdc = (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '').toLowerCase();
      const symbol: SupportedTokenSymbol = (server.token ?? '').toLowerCase() === usdc ? 'USDC' : 'WLD';
      const req = await createRequest({ title, description, budgetToken: symbol, budgetAmount: server.delegatedTokenAmount ?? '0', manager: server.manager });
      router.push(`/requests/${req.id}`);
    } catch (err) {
      console.error('Create request failed', err);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm w-full">
      <p className="text-base font-semibold">Create request</p>
      <label className="grid gap-1 text-xs">
        <span className="text-gray-600">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-xs">
        <span className="text-gray-600">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-xs">
          <span className="text-gray-600">Token</span>
          <select value={token} onChange={(e) => setToken(e.target.value as SupportedTokenSymbol)} className="rounded-xl border border-gray-200 px-3 py-2">
            <option value="USDC">USDC</option>
            <option value="WLD">WLD</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-gray-600">Amount</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="rounded-xl border border-gray-200 px-3 py-2" />
        </label>
      </div>
      <Button type="submit" size="lg" variant="primary" disabled={pending} className="w-full">
        {pending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
};


