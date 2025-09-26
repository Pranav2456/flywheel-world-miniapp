import { Page } from '@/components/PageLayout';
import { RequesterMissions } from '@/components/flywheel/RequesterMissions';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

const mockRequests = [
  {
    id: 'req-1',
    title: 'Morpho WBTC 3x leverage',
    status: 'active' as const,
    collateral: 'WBTC',
    leverage: '3x',
    pnl: '+3.4% (simulated)',
  },
  {
    id: 'req-2',
    title: 'ETH delta-neutral loop',
    status: 'settlement' as const,
    collateral: 'ETH',
    leverage: '2.2x',
    pnl: '+1.2% (simulated)',
  },
  {
    id: 'req-3',
    title: 'WBTC hedged 2.5x strategy',
    status: 'history' as const,
    collateral: 'WBTC',
    leverage: '2.5x',
    pnl: '+4.1% (simulated)',
  },
];

export default async function RequesterDashboardPage() {
  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Requester"
          endAdornment={
            <a
              href="#verify"
              className="text-xs font-semibold text-primary-600"
            >
              Verify now
            </a>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <RequesterMissions missions={mockRequests} />
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Why verification matters</p>
          <p className="text-xs text-gray-600">
            Every request is tied to a World ID verification. Resolvers can trust that
            missions come from unique humans, reducing spam and improving execution
            success.
          </p>
          <a
            href="#verify"
            className="text-xs font-semibold text-primary-600"
          >
            Complete Flywheel verification
          </a>
        </section>
      </Page.Main>
    </>
  );
}


