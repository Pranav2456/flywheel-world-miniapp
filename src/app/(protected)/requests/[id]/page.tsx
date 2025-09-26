import { Page } from '@/components/PageLayout';
import { Button, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

const mockRequestDetail = {
  title: 'Morpho WBTC 3x leverage with 55% max LTV',
  owner: 'atlas.eth',
  commissionBps: 150,
  collateral: 'WBTC',
  leverage: '3x',
  guardrails: [
    'Max LTV 55%, alert at 50%',
    'Daily rebalance or when deviation >2%',
    'Liquidation protection triggers when LTV 53%',
  ],
  timeline: [
    { label: 'Created', value: '2025-09-20 13:04 UTC' },
    { label: 'Status', value: 'Awaiting resolver' },
  ],
};

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <Page.Header className="p-0">
        <TopBar title="Request Details" />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-base font-semibold">{mockRequestDetail.title}</p>
              <p className="text-xs text-gray-500">
                Request {id} · Posted by {mockRequestDetail.owner}
              </p>
            </div>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              {mockRequestDetail.commissionBps / 100}% commission
            </span>
          </div>
          <div className="grid gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
            <p>
              Collateral: <strong>{mockRequestDetail.collateral}</strong> · Target leverage:
              <strong> {mockRequestDetail.leverage}</strong>
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {mockRequestDetail.guardrails.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid w-full gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Timeline</p>
          <div className="grid gap-2 text-xs text-gray-600">
            {mockRequestDetail.timeline.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
          <Link href="/requester" className="text-xs font-semibold text-primary-600">
            View requester dashboard →
          </Link>
        </section>

        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Resolver actions</p>
          <ul className="list-disc space-y-2 pl-5 text-xs text-gray-600">
            <li>Verify identity (Device or Orb) before accepting.</li>
            <li>Accept mission to receive execution checklist.</li>
            <li>Log proofs and reference IDs for every rebalance.</li>
          </ul>
          <Button size="lg" variant="primary" className="w-full">
            Accept request
          </Button>
          <Button size="lg" variant="secondary" className="w-full">
            Preview execution checklist
          </Button>
        </section>
      </Page.Main>
    </>
  );
}


