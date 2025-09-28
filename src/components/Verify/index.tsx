'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel, ResponseEvent, type MiniAppVerifyActionPayload } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FLYWHEEL_VERIFY_ACTION } from '@/lib/minikit';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */

export const Verify = () => {
  const router = useRouter();
  const { isInstalled } = useMiniKit();
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );
  // Prefer provider state over ad-hoc checks; reacts when MiniKit finishes handshake

  useEffect(() => {
    if (!isInstalled) return;

    // Install a handler to silence SDK's "No handler for event miniapp-verify-action" console error
    const handler = (response: MiniAppVerifyActionPayload) => {
      if (response?.status === 'error') {
        setButtonState('failed');
        console.warn('Verify event error', response);
      }
      // Success path is handled by the commandsAsync promise below
    };
    MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, handler);

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppVerifyAction);
    };
  }, [isInstalled]);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    if (!isInstalled) {
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
      const err = result.finalPayload as { error_code?: string };
      const code = err?.error_code ?? 'unknown';
      if (code === 'user_rejected') {
        console.warn('MiniKit verify cancelled by user');
      } else {
        console.error('MiniKit verify error', code, err);
      }
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
    if (
      response.ok &&
      (data?.verifyRes?.success || data?.alreadyVerified === true)
    ) {
      setButtonState('success');
      // Normally you'd do something here since the user is verified
      // Here we'll just do nothing
      // Refresh to reflect server cookie-based verification status in SSR components
      router.refresh();
    } else {
      console.error('Verify API failed', data);
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
      {!isInstalled ? (
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
          disabled={!isInstalled || buttonState === 'pending'}
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
          disabled={!isInstalled || buttonState === 'pending'}
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
