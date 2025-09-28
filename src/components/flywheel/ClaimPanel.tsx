'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';
import type { Abi } from 'viem';

export const ClaimPanel = ({ manager }: { manager?: `0x${string}` }) => {
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const onClaim = async () => {
    if (state === 'pending') return;
    setState('pending');
    try {
      if (!manager) throw new Error('Missing manager address');
      if (!MiniKit.isInstalled()) throw new Error('MiniKit not installed');

      const ClaimAbi = [
        {
          type: 'function',
          name: 'claimStake',
          stateMutability: 'nonpayable',
          inputs: [],
          outputs: [],
        },
      ] as const satisfies Abi;

      const payload = {
        transaction: [
          {
            address: manager,
            abi: ClaimAbi,
            functionName: 'claimStake',
            args: [],
          },
        ],
      } as unknown as Parameters<typeof MiniKit.commandsAsync.sendTransaction>[0];

      const res = await MiniKit.commandsAsync.sendTransaction(payload);
      const finalPayload: { transaction_hash?: string } | undefined = (res as unknown as { finalPayload?: { transaction_hash?: string } }).finalPayload;
      setTxHash(finalPayload?.transaction_hash ?? null);
      setState('success');
    } catch (err) {
      console.error('Claim failed', err);
      setState('failed');
      setTimeout(() => setState('idle'), 1500);
    }
  };

  return (
    <LiveFeedback
      className="w-full"
      label={{ failed: 'Failed', pending: 'Claiming...', success: 'Claimed' }}
      state={state === 'idle' ? undefined : state === 'pending' ? 'pending' : state === 'success' ? 'success' : 'failed'}
    >
      <div className="grid gap-2">
        <Button size="sm" variant="tertiary" className="w-full" onClick={onClaim} disabled={state === 'pending'}>
          Claim stake (requester)
        </Button>
        {txHash ? <p className="text-[11px] text-gray-500">Tx: {txHash}</p> : null}
      </div>
    </LiveFeedback>
  );
};


