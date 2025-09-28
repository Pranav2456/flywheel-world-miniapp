'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Marble, Tabs, TabItem } from '@worldcoin/mini-apps-ui-kit-react';
import { Page } from '@/components/PageLayout';
import { Verify } from '@/components/Verify';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { AuthButton } from '@/components/AuthButton';

type Slide = { id: string; title: string; description: string };

const slides: Slide[] = [
  { id: 'what', title: 'Delegate the work. Share the upside.', description: 'Requesters post leverage missions. Verified resolvers execute them. Settlement is signed with a verifier and tracked on World Chain.' },
  { id: 'how', title: 'Create → Accept/Stake → Execute → Settle', description: 'Post a mission, a resolver accepts with stake (Pyth‑priced), execution happens on mini apps, then settle with a signed result.' },
  { id: 'safety', title: 'Funds & safety', description: 'Stake buffer, acceptable loss, and profit commission are transparent. Identity gating reduces spam. You keep control.' },
  { id: 'identity', title: 'Identity & Wallet', description: 'Sign in with Wallet, then verify once. This enables sponsored gas on World Chain.' },
  { id: 'scope', title: 'Gas & demo scope', description: 'Gas is sponsored for verified users. This demo starts with Morpho; more integrations are on the way.' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isInstalled } = useMiniKit();
  const [currentSlide, setCurrentSlide] = useState<string>(slides[0].id);
  const [isEntering, setIsEntering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === currentSlide) ?? slides[0],
    [currentSlide],
  );

  const refreshVerification = useCallback(async () => {
    try {
      const res = await fetch('/api/verify/status', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = (await res.json()) as { ok?: boolean; verified?: boolean };
      return data.ok === true && data.verified === true;
    } catch (err) {
      console.warn('Failed to refresh verification status', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const verified = await refreshVerification();
      if (verified && !cancelled) {
        router.replace('/home');
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshVerification, router]);

  const waitForVerification = useCallback(async () => {
    const start = Date.now();
    let verified = await refreshVerification();
    while (!verified && Date.now() - start < 10_000) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      verified = await refreshVerification();
    }
    return verified;
  }, [refreshVerification]);

  const handleContinue = useCallback(async () => {
    if (currentSlide === slides[slides.length - 1].id) {
      if (isEntering) return;
      setStatusMessage(null);
      setIsEntering(true);
      const verified = await waitForVerification();
      setIsEntering(false);
      if (!verified) {
        setStatusMessage('Still finalizing verification. Taking you to Flywheel anyway.');
      }
      router.replace('/home');
      return;
    }
    const currentIndex = slides.findIndex((slide) => slide.id === currentSlide);
    setCurrentSlide(slides[currentIndex + 1].id);
  }, [currentSlide, isEntering, router, waitForVerification]);

  return (
    <Page className="bg-white">
      <Page.Main className="flex flex-col justify-between gap-8">
        <div className="flex justify-center pt-8">
          <Marble className="h-16 w-16" />
        </div>

        <div className="flex flex-col items-center gap-6 text-center">
          <Tabs
            value={currentSlide}
            onValueChange={(value) => setCurrentSlide(value)}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex justify-center gap-2">
              {slides.map((slide) => (
                <TabItem
                  key={slide.id}
                  value={slide.id}
                  icon={
                    <span className="block h-2 w-2 rounded-full data-[state=on]:bg-primary-600 bg-gray-300 transition-colors" />
                  }
                  aria-label={slide.title}
                  className="h-auto w-auto p-0"
                />
              ))}
            </div>
          </Tabs>

          <div className="flex flex-col gap-3 px-4">
            <h1 className="text-2xl font-semibold text-gray-900">{activeSlide.title}</h1>
            <p className="text-sm leading-relaxed text-gray-600">
              {activeSlide.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-6">
          {activeSlide.id === 'identity' ? (
            <div className="grid gap-3">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="mb-2 text-sm font-medium text-gray-800">Login with Wallet</p>
                <AuthButton />
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="mb-2 text-sm font-medium text-gray-800">Verify to continue</p>
                <Verify />
              </div>
            </div>
          ) : null}

          <Button size="lg" variant="primary" onClick={handleContinue} disabled={!isInstalled || isEntering}>
            {currentSlide === slides[slides.length - 1].id
              ? isEntering
                ? 'Entering...'
                : 'Enter Flywheel'
              : 'Next'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Wallet auth and verification unlock Flywheel features.
          </p>
          {statusMessage ? (
            <p className="text-xs text-amber-600 text-center">{statusMessage}</p>
          ) : null}
        </div>
      </Page.Main>
    </Page>
  );
}

