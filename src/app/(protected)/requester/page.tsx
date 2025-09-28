import { PageHeader, PageMain } from '@/components/PageLayout';
import { RequesterMissions } from '@/components/flywheel/RequesterMissions';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { CreateRequestForm } from '@/components/flywheel/CreateRequestForm';
import { cookies } from 'next/headers';

export default async function RequesterDashboardPage() {
  const cookieStore = await cookies();
  const isVerified = cookieStore.get('fw_verified')?.value === 'true';
  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${base}/api/contracts/requests/summary`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({ ok: false, items: [] }))) as {
    ok: boolean;
    items: { id: string; title?: string; status: number | null; requester: string | null }[];
  };
  const mapStatus = (s: number | null): 'active' | 'settlement' | 'history' => {
    if (s === 0) return 'active';
    if (s === 1) return 'active';
    if (s === 2 || s === 3 || s === 4) return 'history';
    return 'history';
  };
  const missions = (json.items || []).map((i) => ({
    id: i.id,
    title: i.title ?? `Request ${i.id}`,
    status: mapStatus(i.status),
    collateral: '-',
    leverage: '-',
    pnl: '-',
  }));
  return (
    <>
      <PageHeader className="p-0">
        <TopBar
          title="Requester"
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
      </PageHeader>
      <PageMain className="flex flex-col items-center justify-start gap-4 mb-16">
        <CreateRequestForm />
        <RequesterMissions missions={missions} />
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
      </PageMain>
    </>
  );
}


