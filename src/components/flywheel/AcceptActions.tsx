'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { acceptRequest } from '@/lib/api/contracts';
import { MiniKit } from '@worldcoin/minikit-js';
import { Abi } from 'viem';

export const AcceptActions = ({ requestId }: { requestId: string }) => {
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [len, setLen] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const onAccept = async () => {
    if (state === 'pending') return;
    setState('pending');
    try {
      console.log('[AcceptActions] requesting accept params', { requestId });
      const { priceUpdateData: updates, manager, stakeToken, stakeAmount, updateFeeWei } = await acceptRequest(requestId);
      console.log('[AcceptActions] accept params', { updates: updates.length, manager, stakeToken, stakeAmount, updateFeeWei });
      setLen(updates.length);

      if (!MiniKit.isInstalled()) throw new Error('MiniKit not installed');

      const AcceptAbi = [
        {
          type: 'function',
          name: 'acceptActionRequest',
          stateMutability: 'payable',
          inputs: [{ name: '_pythUpdateData', type: 'bytes[]' }],
          outputs: [],
        },
      ] as const satisfies Abi;

      const payload = {
        transaction: [
          {
            address: manager as `0x${string}`,
            abi: AcceptAbi,
            functionName: 'acceptActionRequest',
            args: [updates as unknown as `0x${string}`[]],
            value: `0x${BigInt(updateFeeWei).toString(16)}`,
          },
        ],
      } as Parameters<typeof MiniKit.commandsAsync.sendTransaction>[0];

      const res = await MiniKit.commandsAsync.sendTransaction(payload);
      const finalPayload: { transaction_hash?: string } | undefined = (res as unknown as { finalPayload?: { transaction_hash?: string } }).finalPayload;
      const hash = finalPayload?.transaction_hash ?? null;
      console.log('[AcceptActions] tx sent', { hash });
      setTxHash(hash);
      setState('success');
    } catch (err) {
      console.error('Accept failed', err);
      setState('failed');
      setTimeout(() => setState('idle'), 1500);
    }
  };

  // Placeholder for on-chain accept; uncomment when manager address and fee are available
  // const onAcceptOnChain = async (managerAddress: `0x${string}`, updateFeeWei?: bigint) => {
  //   if (!priceUpdateData || !MiniKit.isInstalled()) return;
  //   const data = encodeFunctionData({
  //     abi: ActionManagerAbi as unknown as readonly [{ type: string }],
  //     functionName: 'acceptActionRequest',
  //     args: [priceUpdateData as unknown as `0x${string}`[]],
  //   });
  //   const payload = {
  //     transaction: [{ to: managerAddress, data, value: updateFeeWei ? `0x${updateFeeWei.toString(16)}` : undefined }],
  //   } as unknown as Parameters<typeof MiniKit.commandsAsync.sendTransaction>[0];
  //   await MiniKit.commandsAsync.sendTransaction(payload);
  // };

  return (
    <LiveFeedback
      className="w-full"
      label={{ failed: 'Failed', pending: 'Fetching Pyth...', success: 'Ready' }}
      state={state === 'idle' ? undefined : state === 'pending' ? 'pending' : state === 'success' ? 'success' : 'failed'}
    >
      <div className="grid gap-2">
        <Button size="lg" variant="primary" className="w-full" onClick={onAccept} disabled={state === 'pending'}>
          {state === 'pending' ? 'Working...' : 'Accept request'}
        </Button>
        {len !== null ? (
          <p className="text-[11px] text-gray-500">Fetched price update fragments: {len}</p>
        ) : null}
        {txHash ? (
          <p className="text-[11px] text-gray-500">Tx: {txHash}</p>
        ) : null}
      </div>
    </LiveFeedback>
  );
};


