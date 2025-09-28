'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { settleRequest } from '@/lib/api/contracts';
import { MiniKit } from '@worldcoin/minikit-js';
import { Abi } from 'viem';

export const SettlePanel = ({ requestId, manager, delegationToken }: { requestId: string; manager?: `0x${string}`; delegationToken?: `0x${string}` }) => {
  const [amount, setAmount] = useState('0');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [result, setResult] = useState<{ gross: string; commission: string; requesterAmount: string; txHash: string } | null>(null);

  const onSettle = async () => {
    if (state === 'pending') return;
    setState('pending');
    try {
      const preview = await settleRequest(requestId, amount);

      if (!manager) throw new Error('Missing manager address');
      if (!MiniKit.isInstalled()) throw new Error('MiniKit not installed');

      const SettleAbi = [
        {
          type: 'function',
          name: 'settle',
          stateMutability: 'nonpayable',
          inputs: [{ name: '_returnAmount', type: 'uint256' }],
          outputs: [],
        },
      ] as const satisfies Abi;

      const payload = {
        transaction: [
          {
            address: manager,
            abi: SettleAbi,
            functionName: 'settle',
            args: [BigInt(amount)],
          },
        ],
      } as unknown as Parameters<typeof MiniKit.commandsAsync.sendTransaction>[0];

      const res = await MiniKit.commandsAsync.sendTransaction(payload);
      const finalPayload: { transaction_hash?: string } | undefined = (res as unknown as { finalPayload?: { transaction_hash?: string } }).finalPayload;
      const txHash = finalPayload?.transaction_hash ?? '0x' + '0'.repeat(64);

      setResult({ ...preview.settlement, txHash });
      setState('success');
    } catch (err) {
      console.error('Settle failed', err);
      setState('failed');
      setTimeout(() => setState('idle'), 1500);
    }
  };

  return (
    <LiveFeedback
      className="w-full"
      label={{ failed: 'Failed', pending: 'Settling...', success: 'Settled (preview)' }}
      state={state === 'idle' ? undefined : state === 'pending' ? 'pending' : state === 'success' ? 'success' : 'failed'}
    >
      <div className="grid gap-2">
        <input className="rounded-xl border border-gray-200 px-3 py-2 text-xs" placeholder="Return amount (base units)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button size="sm" variant="secondary" className="w-full" onClick={onSettle} disabled={state === 'pending'}>
          Compute settlement
        </Button>
        {result ? (
          <div className="rounded-xl bg-gray-50 p-2 text-[11px] text-gray-600">
            <p>Gross: {result.gross}</p>
            <p>Commission: {result.commission}</p>
            <p>Requester amount: {result.requesterAmount}</p>
            <p>Tx: {result.txHash}</p>
          </div>
        ) : null}
      </div>
    </LiveFeedback>
  );
};


