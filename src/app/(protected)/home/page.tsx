import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { IdentityCard } from '@/components/flywheel/IdentityCard';
import { RoleSnapshot } from '@/components/flywheel/RoleSnapshot';
import { VerificationGate } from '@/components/flywheel/VerificationGate';
import { ActionTiles } from '@/components/flywheel/ActionTiles';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default async function Home() {
  const session = await auth();

  const username = session?.user.username ?? undefined;
  const profilePictureUrl = session?.user.profilePictureUrl ?? undefined;

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Flywheel"
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <IdentityCard
          username={username}
          profilePictureUrl={profilePictureUrl}
          verificationLevel="unverified"
          nextActionHint="Verify to create or accept leverage missions."
        />
        <RoleSnapshot role="both" activeAssignments={1} pendingRequests={2} />
        <VerificationGate />
        <ActionTiles />
      </Page.Main>
    </>
  );
}
