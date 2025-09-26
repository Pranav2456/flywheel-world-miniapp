'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useEffect, useState } from 'react';
import { FLYWHEEL_VERIFY_ACTION } from '@/lib/minikit';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */

export const Verify = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );
  const [isMiniKitReady, setIsMiniKitReady] = useState<boolean>(false);

  useEffect(() => {
    setIsMiniKitReady(MiniKit.isInstalled());
  }, []);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    if (!MiniKit.isInstalled()) {
      setButtonState('failed');
      console.warn('MiniKit is not installed. Open the mini app inside World App.');
      return;
    }

    setButtonState('pending');
    setWhichVerification(verificationLevel);
    const result = await MiniKit.commandsAsync.verify({
      action: FLYWHEEL_VERIFY_ACTION,
      verification_level: verificationLevel,
    });

    if (result.finalPayload.status === 'error') {
      console.error('MiniKit verify error', result.finalPayload);
      setButtonState('failed');
      setTimeout(() => setButtonState(undefined), 2000);
      return;
    }

    // Verify the proof
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: result.finalPayload,
        action: FLYWHEEL_VERIFY_ACTION,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.verifyRes.success) {
      setButtonState('success');
      // Normally you'd do something here since the user is verified
      // Here we'll just do nothing
    } else {
      setButtonState('failed');

      // Reset the button state after 3 seconds
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  return (
    <section id="verify" className="grid w-full gap-4">
      <p className="text-lg font-semibold">Verify</p>
      {!isMiniKitReady ? (
        <p className="text-xs text-gray-500">
          Verification requires running inside World App or an environment with
          MiniKit installed. Open this mini app on your device to continue.
        </p>
      ) : null}
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={
          whichVerification === VerificationLevel.Device
            ? buttonState
            : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Device)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="tertiary"
          className="w-full"
        >
          Verify (Device)
        </Button>
      </LiveFeedback>
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={
          whichVerification === VerificationLevel.Orb ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verify (Orb)
        </Button>
      </LiveFeedback>
    </section>
  );
};
