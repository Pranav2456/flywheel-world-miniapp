import {
  ISuccessResult,
  IVerifyResponse,
  verifyCloudProof,
} from '@worldcoin/minikit-js';
import { NextRequest, NextResponse } from 'next/server';

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal?: string;
}

const appId = process.env.APP_ID as `app_${string}` | undefined;

/**
 * Verify World ID proofs in a trusted environment.
 * See docs: https://docs.world.org/mini-apps/commands/verify.md
 */
export async function POST(req: NextRequest) {
  const { payload, action, signal } = (await req.json()) as IRequestPayload;

  if (!payload || !action) {
    return NextResponse.json(
      { error: 'Missing payload or action' },
      { status: 400 },
    );
  }

  if (!appId) {
    console.error('[verify] Missing APP_ID env var');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    const verifyRes = (await verifyCloudProof(
      payload,
      appId,
      action,
      signal,
    )) as IVerifyResponse;

    if (verifyRes.success) {
      const res = NextResponse.json({ verifyRes, status: 200 }, { status: 200 });
      const isProd = process.env.NODE_ENV === 'production';

      // Persist verification status for server components to read
      res.cookies.set('fw_verified', 'true', {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      // Store raw verification level; consumers can map to labels
      const levelRaw = String(payload.verification_level ?? '');
      res.cookies.set('fw_verified_level', levelRaw, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      return res;
    }

    // Treat duplicate/limit/previous verification as "already verified" and persist session cookies
    const code = (verifyRes as unknown as { code?: string })?.code?.toLowerCase?.();
    const detail = (verifyRes as unknown as { detail?: string })?.detail?.toLowerCase?.();
    const alreadyCodes = new Set([
      'already_signed',
      'duplicate_nullifier',
      'already_verified',
      'user_already_verified',
      'person_already_verified',
      'action_already_completed',
      'max_verifications_reached',
      'max_verifications_exceeded',
    ]);
    const isAlreadyVerified =
      (!!code && (alreadyCodes.has(code) || code.includes('already') || code.includes('duplicate') || code.includes('max_verifications')))
      || (!!detail && (detail.includes('already verified') || detail.includes('previously') || detail.includes('already signed')));

    if (isAlreadyVerified) {
      const res = NextResponse.json({ verifyRes, status: 200, alreadyVerified: true }, { status: 200 });
      const isProd = process.env.NODE_ENV === 'production';

      res.cookies.set('fw_verified', 'true', {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });

      const levelRaw = String((payload as ISuccessResult | undefined)?.verification_level ?? 'device');
      res.cookies.set('fw_verified_level', levelRaw, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });

      return res;
    }

    return NextResponse.json({ verifyRes, status: 400 }, { status: 400 });
  } catch (err) {
    console.error('[verify] Verification failed', err);
    return NextResponse.json({ error: 'Verification failed', status: 500 }, { status: 500 });
  }
}


