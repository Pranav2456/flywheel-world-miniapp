import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { IdentityCard } from '@/components/flywheel/IdentityCard';
import { RoleSnapshot } from '@/components/flywheel/RoleSnapshot';
import { ActionTiles } from '@/components/flywheel/ActionTiles';
import Link from 'next/link';
import { MiniAppPicker } from '@/components/flywheel/MiniAppPicker';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { getVerificationLabelFromRaw } from '@/lib/minikit';
import { cookies } from 'next/headers';

export default async function Home() {
  const session = await auth();
  const cookieStore = await cookies();
  const levelRaw = cookieStore.get('fw_verified_level')?.value ?? undefined;
  const verificationLevel = getVerificationLabelFromRaw(levelRaw);

  const username = session?.user.username ?? undefined;
  const profilePictureUrl = session?.user.profilePictureUrl ?? undefined;

  const base = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const res = await fetch(`${base}/api/contracts/requests/summary`, { cache: 'no-store' });
  const json = (await res.json().catch(() => ({ ok: false, items: [] }))) as {
    ok: boolean;
    items: { id: string; status: number | null; requester: string | null; resolver: string | null }[];
  };
  const me = session?.user.walletAddress?.toLowerCase?.();
  const items = Array.isArray(json.items) ? json.items : [];
  const activeAssignments = items.filter((i) => i.status === 1 && i.resolver && i.resolver.toLowerCase() === me).length;
  const pendingRequests = items.filter((i) => i.status === 0 && i.requester && i.requester.toLowerCase() === me).length;
  const executingMine = items.find((i) => i.status === 1 && i.resolver && i.resolver.toLowerCase() === me);
  const activeMine = items.find((i) => i.status === 0 && i.requester && i.requester.toLowerCase() === me);

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Flywheel"
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <MiniAppPicker />
        <IdentityCard
          username={username}
          profilePictureUrl={profilePictureUrl}
          verificationLevel={verificationLevel}
          walletAddress={session?.user.walletAddress ?? undefined}

        />
        <RoleSnapshot
          role="both"
          activeAssignments={activeAssignments}
          pendingRequests={pendingRequests}
          title="Your snapshot"
          hint="Live view of your missions and requests."
          hideSwitch
        />

        {/* Quick actions */}
        <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-base font-semibold">Quick actions</p>
          <div className="grid gap-2">
            <Link href="/requester" className="grid gap-1 rounded-xl border border-gray-100 p-4 hover:border-primary-200">
              <p className="text-sm font-semibold">Create request</p>
              <p className="text-xs text-gray-500">Set targets and guardrails for resolvers.</p>
            </Link>
            <Link href="/requests" className="grid gap-1 rounded-xl border border-gray-100 p-4 hover:border-primary-200">
              <p className="text-sm font-semibold">Browse requests</p>
              <p className="text-xs text-gray-500">Discover open missions and accept one to start.</p>
            </Link>
            <Link href="/resolver" className="grid gap-1 rounded-xl border border-gray-100 p-4 hover:border-primary-200">
              <p className="text-sm font-semibold">My assignments</p>
              <p className="text-xs text-gray-500">Track executing missions and log steps.</p>
            </Link>
          </div>
        </section>

        {/* Continue where you left off */}
        {(executingMine || activeMine) ? (
          <section className="grid w-full gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-base font-semibold">Continue where you left off</p>
            {executingMine ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm">
                <div className="grid gap-1">
                  <p className="font-semibold">Assignment in progress</p>
                  <p className="text-xs text-gray-500">Open request {executingMine.id} to log an execution step.</p>
                </div>
                <Link href={`/requests/${executingMine.id}`} className="rounded-full border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-600">Open</Link>
              </div>
            ) : null}
            {!executingMine && activeMine ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm">
                <div className="grid gap-1">
                  <p className="font-semibold">Your request is live</p>
                  <p className="text-xs text-gray-500">Share or browse to find a resolver for request {activeMine.id}.</p>
                </div>
                <Link href={`/requests/${activeMine.id}`} className="rounded-full border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-600">View</Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Suggestions */}
        <ActionTiles />
      </Page.Main>
    </>
  );
}
