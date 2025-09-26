import { MiniKit } from '@worldcoin/minikit-js';

export const FLYWHEEL_VERIFY_ACTION = 'flywheel-leverage-access' as const;

export const isWorldApp = () => {
  if (typeof window === 'undefined') return false;
  if (MiniKit.isInstalled && typeof MiniKit.isInstalled === 'function') {
    return MiniKit.isInstalled();
  }
  const globalMiniKit = (window as typeof window & { __MINIKIT__?: { isInstalled?: boolean } }).__MINIKIT__;
  return !!globalMiniKit?.isInstalled;
};
