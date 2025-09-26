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
      return NextResponse.json({ verifyRes }, { status: 200 });
    }

    return NextResponse.json({ verifyRes }, { status: 400 });
  } catch (err) {
    console.error('[verify] Verification failed', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}


