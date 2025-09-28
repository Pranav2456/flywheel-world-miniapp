import { PageHeader, PageMain } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { AcceptActions } from '@/components/flywheel/AcceptActions';
import { ExecutePanel } from '@/components/flywheel/ExecutePanel';
import { SettlePanel } from '@/components/flywheel/SettlePanel';
import { ClaimPanel } from '@/components/flywheel/ClaimPanel';
import { notFound } from 'next/navigation';

type RequestDetailPageProps = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  // Try to read from API (server-to-server fetch)
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${base}/api/contracts/requests/${id}`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({ ok: false }))) as {
    ok: boolean;
    request?: { id: string; title?: string; description?: string; manager?: `0x${string}`; budgetToken?: string; budgetAmount?: string };
    onchain?: { status?: number; endingTimestamp?: string; details?: { requester: string | null; resolver: string | null; delegationToken: `0x${string}` | null; delegatedAmount: string | null; stakeToken: `0x${string}` | null; stakedAmount: string | null } | unknown; econ?: unknown; delegationToken?: `0x${string}` };
  };
  if (!res.ok || !json?.ok) notFound();

  const statusLabel = (s?: number) =>
    s === 0 ? 'Active' : s === 1 ? 'Executing' : s === 2 ? 'Settled' : s === 3 ? 'Cancelled' : s === 4 ? 'Failed' : 'Unknown';

  const shorten = (addr?: string | null) => (addr && addr.startsWith('0x') ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr ?? '—');

  const formatUnits = (amount?: string | null, decimals?: number) => {
    if (!amount) return '—';
    const s = amount.replace(/^0x/, '');
    const d = typeof decimals === 'number' ? decimals : 18;
    const neg = s.startsWith('-');
    const digits = neg ? s.slice(1) : s;
    const pad = d - digits.length;
    const whole = pad >= 0 ? '0' : digits.slice(0, digits.length - d);
    let frac = pad >= 0 ? '0'.repeat(pad) + digits : digits.slice(digits.length - d);
    // trim
    frac = frac.replace(/0+$/, '');
    const withDot = frac.length ? `${whole}.${frac}` : whole;
    const withCommas = withDot.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return neg ? `-${withCommas}` : withCommas;
  };

  const formatTokenAmount = (amount?: string | null, symbol?: string) => {
    const decimals = symbol === 'USDC' ? 6 : 18;
    const v = formatUnits(amount ?? null, decimals);
    return `${v} ${symbol ?? ''}`.trim();
  };

  const formatTimestamp = (secs?: string) => {
    if (!secs) return '—';
    const n = Number(secs);
    if (!Number.isFinite(n)) return '—';
    const d = new Date(n * 1000);
    const dt = d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return dt;
  };

  return (
    <>
      <PageHeader className="p-0">
        <TopBar title="Request Details" />
      </PageHeader>
      <PageMain className="flex flex-col items-center justify-start gap-5 mb-16">
        <section className="grid w-full gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-base font-semibold">{json.request?.title ?? `Request ${id}`}</p>
              <p className="text-xs text-gray-500">ID: {json.request?.id ?? id}</p>
              <p className="text-xs text-gray-500 break-all">
                <span className="font-medium text-gray-600">Manager:</span> <span className="font-mono">{shorten(json.request?.manager)}</span>
              </p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              {statusLabel(json.onchain?.status)}
            </span>
          </div>
          {json.request?.description ? (
            <div className="grid gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
              <p className="whitespace-pre-wrap">{json.request.description}</p>
            </div>
          ) : null}
        </section>

        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Timeline</p>
          <div className="grid gap-2 text-xs text-gray-600">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-medium text-gray-700">Budget</span>
              <span>
                {(() => {
                  const onchainToken = (json.onchain?.delegationToken ?? '').toLowerCase();
                  const usdc = (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '').toLowerCase();
                  const wld = (process.env.NEXT_PUBLIC_WLD_ADDRESS ?? '').toLowerCase();
                  const symbol = onchainToken
                    ? onchainToken === usdc
                      ? 'USDC'
                      : onchainToken === wld
                        ? 'WLD'
                        : json.request?.budgetToken
                    : json.request?.budgetToken;
                  return formatTokenAmount(json.request?.budgetAmount ?? null, symbol);
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="font-medium text-gray-700">Status</span>
              <span>{statusLabel(json.onchain?.status)}</span>
            </div>
            {json.onchain?.endingTimestamp ? (
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="font-medium text-gray-700">Ends</span>
                <span>{formatTimestamp(json.onchain.endingTimestamp)}</span>
              </div>
            ) : null}
          </div>
          <Link href="/requester" className="text-xs font-semibold text-primary-600 mt-1">
            View requester dashboard →
          </Link>
        </section>

        <section className="grid w-full gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold">Resolver actions</p>
          <ul className="list-disc space-y-2 pl-5 text-xs text-gray-600">
            <li>Verify identity (Device or Orb) before accepting.</li>
            <li>Accept mission to receive execution checklist.</li>
            <li>Log proofs and reference IDs for every rebalance.</li>
          </ul>
          <div className="grid gap-4">
            <AcceptActions requestId={id} />
            <ExecutePanel requestId={id} />
            <SettlePanel requestId={id} manager={json?.request?.manager as `0x${string}` | undefined} />
            <ClaimPanel manager={json?.request?.manager as `0x${string}` | undefined} />
          </div>
        </section>
      </PageMain>
    </>
  );
}


