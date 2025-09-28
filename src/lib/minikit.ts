import { MiniKit } from '@worldcoin/minikit-js';

export const FLYWHEEL_VERIFY_ACTION = 'flywheel-leverage-access' as const;

export type VerificationLevelLabel = 'device' | 'orb' | 'unverified';

export function getVerificationLabelFromRaw(level?: string): VerificationLevelLabel {
  if (level === undefined || level === null) return 'unverified';
  const normalized = String(level).toLowerCase();
  if (normalized.includes('orb')) return 'orb';
  if (normalized.includes('device')) return 'device';
  // Some SDKs may return 0/1 for enum values. Map conservatively.
  if (normalized === '0' || normalized === '1') return 'device';
  return 'unverified';
}

export const isWorldApp = () => {
  if (typeof window === 'undefined') return false;
  if (MiniKit.isInstalled && typeof MiniKit.isInstalled === 'function') {
    return MiniKit.isInstalled();
  }
  const globalMiniKit = (window as typeof window & { __MINIKIT__?: { isInstalled?: boolean } }).__MINIKIT__;
  return !!globalMiniKit?.isInstalled;
};

// Permit2 helpers removed in simplified v2. Transactions are sent directly without token permits.
