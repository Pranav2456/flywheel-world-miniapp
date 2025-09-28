import { NextResponse } from 'next/server';
import { createReferenceId } from '@/lib/references';
import { store } from '@/lib/store';
import { cookies } from 'next/headers';

async function requireVerifiedCookie() {
  const cookieStore = await cookies();
  const v = cookieStore.get('fw_verified')?.value;
  if (v !== 'true') {
    return NextResponse.json({ ok: false, code: 'NOT_VERIFIED' }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request, context: unknown) {
  const guard = await requireVerifiedCookie();
  if (guard) return guard;

  const { note } = await req.json();
  const { params } = context as { params: { id: string } };
  const ref = createReferenceId();
  store.addExecution({ id: ref, requestId: params.id, note, ts: Date.now() });
  return NextResponse.json({ ok: true, reference: ref });
}


