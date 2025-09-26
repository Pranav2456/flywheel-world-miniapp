import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

const mockRequests = [
  {
    id: 'req-1',
    title: 'Morpho WBTC 3x with 55% max LTV',
    collateral: 'WBTC',
    leverage: '3x',
    commissionBps: 150,
    riskRating: 'medium' as const,
  },
  {
    id: 'req-2',
    title: 'ETH delta-neutral loop (2.2x)',
    collateral: 'ETH',
    leverage: '2.2x',
    commissionBps: 120,
    riskRating: 'low' as const,
  },
  {
    id: 'req-3',
    title: 'USDC Morpho PP 4x (70% ceiling)',
    collateral: 'USDC',
    leverage: '4x',
    commissionBps: 200,
    riskRating: 'high' as const,
  },
];

const riskStyle = {
  low: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-rose-600 bg-rose-50',
};

export default async function RequestsPage() {
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
            {mockRequests.map((request) => (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="grid gap-2 rounded-xl border border-gray-100 p-4 hover:border-primary-200"
              >
                <div className="flex items-start justify-between">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">{request.title}</p>
                    <p className="text-xs text-gray-500">
                      {request.collateral} · {request.leverage} leverage ·
                      commission {request.commissionBps / 100}%
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${riskStyle[request.riskRating]}`}
                  >
                    {request.riskRating.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Guardrails: Max LTV 55%, daily rebalance; resolver auto-notified if breach.
                </p>
              </Link>
            ))}
          </div>
        </section>
      </Page.Main>
    </>
  );
}


