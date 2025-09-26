'use client';

import { Verify } from '@/components/Verify';
import { Marble } from '@worldcoin/mini-apps-ui-kit-react';

type VerificationLevelLabel = 'device' | 'orb' | 'unverified';

export interface IdentityCardProps {
  username?: string | null;
  profilePictureUrl?: string | null;
  verificationLevel: VerificationLevelLabel;
  nextActionHint?: string;
}

const verificationCopy: Record<VerificationLevelLabel, string> = {
  device: 'Device verified',
  orb: 'Orb verified',
  unverified: 'Verification required',
};

export const IdentityCard = ({
  username,
  profilePictureUrl,
  verificationLevel,
  nextActionHint,
}: IdentityCardProps) => {
  const title = username ? `Welcome, ${username}` : 'Welcome to Flywheel';

  return (
    <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Marble src={profilePictureUrl ?? undefined} className="h-12 w-12" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-none">{title}</p>
          <p className="text-sm text-gray-500">
            {verificationCopy[verificationLevel]}
          </p>
          {nextActionHint ? (
            <p className="text-xs text-gray-400">{nextActionHint}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3">
        <p className="text-sm font-medium text-gray-700">
          Verify your identity to unlock requests and assignments
        </p>
        <Verify />
      </div>
    </section>
  );
};


