import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { Page } from '@/components/PageLayout';
import { IdentityCard } from '@/components/flywheel/IdentityCard';
import { RoleSnapshot } from '@/components/flywheel/RoleSnapshot';
import { ActionTiles } from '@/components/flywheel/ActionTiles';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { getVerificationLabelFromRaw } from '@/lib/minikit';

export default async function Home() {
  const session = await auth();
  const cookieStore = await cookies();
  const verified = cookieStore.get('fw_verified')?.value === 'true';
  const verifiedLevelRaw = cookieStore.get('fw_verified_level')?.value;
  const verificationLevel = verified
    ? getVerificationLabelFromRaw(verifiedLevelRaw)
    : 'unverified';

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
          verificationLevel={verificationLevel}
          nextActionHint={
            verificationLevel === 'unverified'
              ? 'Verify to create or accept leverage missions.'
              : undefined
          }
        />
        <RoleSnapshot role="both" activeAssignments={1} pendingRequests={2} />
        {/* Removed duplicate VerificationGate to avoid two CTAs. IdentityCard already includes <Verify /> */}
        <ActionTiles />
      </Page.Main>
    </>
  );
}
