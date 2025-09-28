import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

const riskStyle = {
  low: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-rose-600 bg-rose-50',
};

export default async function RequestsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${base}/api/contracts/requests`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({ ok: false, items: [] }))) as { ok: boolean; items: { id: string; title?: string; description?: string }[] };
  const items = Array.isArray(json.items) ? json.items : [];
  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="Requests" />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <header className="flex items-center justify-between">
            <p className="text-base font-semibold">Open leverage missions</p>
            <Link href="/requester" className="text-sm font-semibold text-primary-600">
              Create request
            </Link>
          </header>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 font-semibold text-primary-600">
              All statuses
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-1 text-gray-500">
              Low risk
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-1 text-gray-500">
              Collateral: WBTC
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-1 text-gray-500">
              Commission ≤ 2%
            </button>
          </div>
          <div className="grid gap-3">
            {items.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="grid gap-2 rounded-xl border border-gray-100 p-4 hover:border-primary-200"
              >
                <div className="flex items-start justify-between">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">{request.title ?? `Request ${request.id}`}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{request.description ?? '—'}</p>
                  </div>
                  <span className="rounded-full px-2 py-1 text-xs font-semibold text-primary-600 bg-primary-50">View</span>
                </div>
              </Link>
            ))}
            {items.length === 0 ? (
              <p className="text-xs text-gray-500">No requests yet. Create one from the requester dashboard.</p>
            ) : null}
          </div>
        </section>
      </Page.Main>
    </>
  );
}


