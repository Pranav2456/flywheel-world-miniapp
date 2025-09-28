'use client';

import { Verify } from '@/components/Verify';
import { Marble } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useEffect, useMemo, useState } from 'react';

type VerificationLevelLabel = 'device' | 'orb' | 'unverified';

export interface IdentityCardProps {
  username?: string | null;
  profilePictureUrl?: string | null;
  verificationLevel: VerificationLevelLabel;
  nextActionHint?: string;
  walletAddress?: string | null;
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
  walletAddress,
}: IdentityCardProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profilePictureUrl ?? undefined);
  const title = username ? `Welcome, ${username}` : 'Welcome to Flywheel';
  const shortWallet = useMemo(() => {
    const w = walletAddress ?? (typeof window !== 'undefined' ? (MiniKit as any)?.walletAddress : undefined);
    if (!w) return undefined;
    return `${w.slice(0, 6)}…${w.slice(-4)}`;
  }, [walletAddress]);

  useEffect(() => {
    if (avatarUrl) return;
    const load = async () => {
      try {
        const addr = (walletAddress ?? (MiniKit as any)?.walletAddress) as string | undefined;
        if (!addr) return;
        const u = await MiniKit.getUserInfo(addr as `0x${string}`);
        if (u?.profilePictureUrl) setAvatarUrl(u.profilePictureUrl);
      } catch {
        // ignore
      }
    };
    load();
  }, [avatarUrl, walletAddress]);

  return (
    <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Marble src={avatarUrl ?? undefined} className="h-12 w-12" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold leading-none">{title}</p>
          <p className="text-sm text-gray-500">
            {verificationCopy[verificationLevel]}
          </p>
          {shortWallet ? (
            <p className="text-[11px] text-gray-400">{shortWallet}</p>
          ) : null}
          {nextActionHint ? (
            <p className="text-xs text-gray-400">{nextActionHint}</p>
          ) : null}
        </div>
      </div>
      {verificationLevel === 'unverified' ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-gray-700">
            Verify your identity to unlock requests and assignments
          </p>
          <Verify />
        </div>
      ) : null}
    </section>
  );
};


