'use client';

import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { executeStep } from '@/lib/api/contracts';

export const ExecutePanel = ({ requestId }: { requestId: string }) => {
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [reference, setReference] = useState<string | null>(null);

  const onLog = async () => {
    if (state === 'pending') return;
    setState('pending');
    try {
      const res = await executeStep(requestId, note);
      setReference(res.reference);
      setState('success');
    } catch (err) {
      console.error('Execution log failed', err);
      setState('failed');
      setTimeout(() => setState('idle'), 1500);
    }
  };

  return (
    <LiveFeedback
      className="w-full"
      label={{ failed: 'Failed', pending: 'Saving...', success: 'Logged' }}
      state={state === 'idle' ? undefined : state === 'pending' ? 'pending' : state === 'success' ? 'success' : 'failed'}
    >
      <div className="grid gap-2">
        <textarea className="rounded-xl border border-gray-200 px-3 py-2 text-xs" placeholder="Execution note" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button size="sm" variant="tertiary" className="w-full" onClick={onLog} disabled={state === 'pending'}>
          Log execution reference
        </Button>
        {reference ? (
          <p className="text-[11px] text-gray-500">Reference: {reference}</p>
        ) : null}
      </div>
    </LiveFeedback>
  );
};


