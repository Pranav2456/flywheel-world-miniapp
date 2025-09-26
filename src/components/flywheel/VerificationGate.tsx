'use client';

import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

export const VerificationGate = () => {
  return (
    <section className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <p className="text-base font-semibold">Proof of personhood required</p>
          <p className="text-xs text-gray-500">
            Complete the Flywheel verification to create requests or accept missions
            (tap when inside World App).
          </p>
        </div>
        <Link href="#verify" className="inline-flex">
          <Button size="sm" variant="primary">
            Verify now
          </Button>
        </Link>
      </div>
      <p className="text-xs text-gray-600">
        Verification is a one-time action enforced by World ID Incognito Actions.
        It ensures each mission is tied to a unique human account. Learn more in the
        <Link
          href="https://docs.world.org/mini-apps/commands/verify"
          className="ml-1 font-semibold text-primary-600"
          target="_blank"
        >
          World docs
        </Link>
        . Ensure MiniKit is loaded before attempting verification.
      </p>
    </section>
  );
};


