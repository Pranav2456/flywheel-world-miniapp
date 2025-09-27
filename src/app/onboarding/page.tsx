'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Marble, Tabs, TabItem } from '@worldcoin/mini-apps-ui-kit-react';
import { Page } from '@/components/PageLayout';
import { Verify } from '@/components/Verify';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';

type Slide = {
  id: string;
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    id: 'delegation',
    title: 'Define your mission',
    description:
      'Set the outcome you want on World Chain. Specify target exposure, acceptable risk band, and the reward you are offering.',
  },
  {
    id: 'guardrails',
    title: 'Choose who executes',
    description:
      'Resolvers browse missions and stake their reputation to fulfill them. If a resolver meets your requirements, they can step in and keep the mission compliant.',
  },
  {
    id: 'earn',
    title: 'Share the upside',
    description:
      'Once a mission is completed, Flywheel reconciles results and moves the agreed reward on-chain. Everyone sees clear references.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isInstalled } = useMiniKit();
  const [currentSlide, setCurrentSlide] = useState<string>(slides[0].id);
  const activeSlide = useMemo(
    () => slides.find((slide) => slide.id === currentSlide) ?? slides[0],
    [currentSlide],
  );

  const handleContinue = () => {
    if (currentSlide === slides[slides.length - 1].id) {
      router.push('/home');
      return;
    }
    const currentIndex = slides.findIndex((slide) => slide.id === currentSlide);
    setCurrentSlide(slides[currentIndex + 1].id);
  };

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
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="mb-2 text-sm font-medium text-gray-800">Verify to continue</p>
            <Verify />
          </div>
          <Button size="lg" variant="primary" onClick={handleContinue} disabled={!isInstalled}>
            {currentSlide === slides[slides.length - 1].id ? 'Enter Flywheel' : 'Next'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Verification is required before using Flywheel features.
          </p>
        </div>
      </Page.Main>
    </Page>
  );
}

