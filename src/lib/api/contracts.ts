import type { RequestItem, SettlementPreview, SupportedTokenSymbol } from '@/types/contracts';

export async function listRequests(): Promise<RequestItem[]> {
  const res = await fetch('/api/contracts/requests', { cache: 'no-store' });
  const json = await res.json();
  return json.items as RequestItem[];
}

export async function createRequest(input: {
  title: string;
  description?: string;
  budgetToken: SupportedTokenSymbol;
  budgetAmount: string; // base units
  manager?: string;
}): Promise<RequestItem> {
  const res = await fetch('/api/contracts/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error('Failed to create request');
  return json.request as RequestItem;
}

export async function acceptRequest(requestId: string): Promise<{
  priceUpdateData: string[];
  manager: `0x${string}`;
  stakeToken: `0x${string}`;
  stakeAmount: string;
  updateFeeWei: string;
}>
{
  const res = await fetch(`/api/contracts/requests/${requestId}/accept`, { method: 'POST' });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error('Failed to fetch accept parameters');
  return {
    priceUpdateData: json.priceUpdateData as string[],
    manager: json.manager as `0x${string}`,
    stakeToken: json.stakeToken as `0x${string}`,
    stakeAmount: String(json.stakeAmount ?? '0'),
    updateFeeWei: String(json.updateFeeWei ?? '0'),
  };
}

export async function executeStep(requestId: string, note?: string): Promise<{ reference: string }>
{
  const res = await fetch(`/api/contracts/requests/${requestId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error('Failed to log execution');
  return { reference: json.reference as string };
}

export async function settleRequest(requestId: string, returnAmount: string): Promise<{ settlement: SettlementPreview; txHash: string }>
{
  const res = await fetch(`/api/contracts/requests/${requestId}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnAmount }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error('Failed to settle');
  return { settlement: json.settlement as SettlementPreview, txHash: json.txHash as string };
}

export async function signSettlement(requestId: string, returnAmount: string): Promise<{ signature: `0x${string}` }>
{
  const res = await fetch(`/api/contracts/requests/${requestId}/settle/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnAmount }),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error('Failed to sign settlement');
  return { signature: json.signature as `0x${string}` };
}


