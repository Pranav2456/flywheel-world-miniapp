import { Page } from '@/components/PageLayout';
import { Button, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AcceptActions } from '@/components/flywheel/AcceptActions';
import { auth } from '@/auth';

const executionChecklist = [
  'Confirm verification and mission ownership.',
  'Review guardrails and leverage ceiling before action.',
  'Record on-chain tx + reference ID after each rebalance.',
  'Update requester with status notes via notifications.',
];

export default async function ResolverDashboardPage() {
  const cookieStore = await cookies();
  const isVerified = cookieStore.get('fw_verified')?.value === 'true';
  const session = await auth();
  const myAddress = session?.user?.walletAddress?.toLowerCase?.();
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${base}/api/contracts/requests/summary`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({ ok: false, items: [] }))) as {
    ok: boolean;
    items: { id: string; title?: string; description?: string; status: number | null; resolver: string | null; requester?: string | null; manager?: string | null; endingTimestamp: string | null }[];
  };
  const all = Array.isArray(json.items) ? json.items : [];
  const myAssignments = all.filter((i) => i.status === 1 && i.resolver && i.resolver.toLowerCase() === myAddress);
  const openRequests = all.filter((i) => i.status === 0);

  const formatTimestamp = (secs?: string | null) => {
    if (!secs) return '—';
    const n = Number(secs);
    if (!Number.isFinite(n)) return '—';
    const d = new Date(n * 1000);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Page.Header className="p-0">

        <TopBar
          title="Resolver"
          endAdornment={
            !isVerified ? (
              <a
                href="#verify"
                className="text-xs font-semibold text-primary-600"
              >
                Verify now
              </a>
            ) : undefined
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-5 mb-16">
        <section className="grid w-full gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
            {myAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="grid gap-2 rounded-xl border border-gray-100 p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="grid gap-1">
                    <p className="font-semibold">{assignment.title ?? `Request ${assignment.id}`}</p>
                    <p className="text-xs text-gray-500">Ends: {formatTimestamp(assignment.endingTimestamp)}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                    Executing
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/requests/${assignment.id}`} className="grow">
                    <Button size="sm" variant="secondary" className="w-full">Open</Button>
                  </Link>
                </div>
              </div>
            ))}
            {myAssignments.length === 0 ? (
              <p className="text-xs text-gray-500">No active assignments. Browse open missions to accept one.</p>
            ) : null}
          </div>
        </section>
        <section className="grid w-full gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">Open requests</p>
              <p className="text-xs text-gray-500">Accept a mission to begin executing.</p>
            </div>
          </header>
          <div className="grid gap-3">
            {openRequests.map((r) => (
              <div key={r.id} className="grid gap-3 rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold">{r.title ?? `Request ${r.id}`}</p>
                    <p className="text-xs text-gray-500">Ends: {formatTimestamp(r.endingTimestamp)}</p>
                  </div>
                  <Link href={`/requests/${r.id}`} className="text-xs font-semibold text-primary-600">Details →</Link>
                </div>
                <AcceptActions requestId={r.id} />
              </div>
            ))}
            {openRequests.length === 0 ? (
              <p className="text-xs text-gray-500">No open requests right now.</p>
            ) : null}
          </div>
        </section>
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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


