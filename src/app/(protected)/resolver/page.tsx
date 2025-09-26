import { Page } from '@/components/PageLayout';
import { Button, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

const mockAssignments = [
  {
    id: 'req-1',
    title: 'Morpho WBTC 3x leverage',
    status: 'Monitoring',
    nextCheckpoint: 'Rebalance in 3h',
    alert: 'LTV 51% – watch liquidation buffer',
  },
  {
    id: 'req-3',
    title: 'USDC Morpho PP 4x (70% ceiling)',
    status: 'Executing',
    nextCheckpoint: 'Swap hedges in 1d',
  },
];

const executionChecklist = [
  'Confirm verification and mission ownership.',
  'Review guardrails and leverage ceiling before action.',
  'Record on-chain tx + reference ID after each rebalance.',
  'Update requester with status notes via notifications.',
];

export default async function ResolverDashboardPage() {
  return (
    <>
      <Page.Header className="p-0">

        <TopBar
          title="Resolver"
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
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">Assignments overview</p>
              <p className="text-xs text-gray-500">
                Monitor leverage levels and upcoming checkpoints.
              </p>
            </div>
            <Button size="sm" variant="primary">
              Find missions
            </Button>
          </header>
          <div className="grid gap-3">
            {mockAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="grid gap-2 rounded-xl border border-gray-100 p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="grid gap-1">
                    <p className="font-semibold">{assignment.title}</p>
                    <p className="text-xs text-gray-500">
                      Next checkpoint: {assignment.nextCheckpoint}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                    {assignment.status}
                  </span>
                </div>
                {assignment.alert ? (
                  <p className="rounded-md bg-rose-50 p-2 text-xs font-semibold text-rose-600">
                    {assignment.alert}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="grow">
                    Update status
                  </Button>
                  <Button size="sm" variant="tertiary" className="grow">
                    Log proof
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Execution checklist</p>
          <ul className="list-disc space-y-2 pl-5 text-xs text-gray-600">
            {executionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button size="sm" variant="primary" className="w-full">
            View detailed checklist
          </Button>
        </section>
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold">Commission payouts</p>
          <p className="text-xs text-gray-600">
            Use MiniKit pay with provided reference IDs to claim commission once
            settlement is approved. Server reconciliation will confirm references.
          </p>
          <Button size="sm" variant="secondary" className="w-full">
            View payout references
          </Button>
        </section>
      </Page.Main>
    </>
  );
}


