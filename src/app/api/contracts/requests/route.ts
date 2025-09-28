import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getDb } from '@/lib/db/mongo';
import { createReferenceId } from '@/lib/references';
import { cookies } from 'next/headers';
import { auth } from '@/auth';

async function requireVerifiedCookie() {
  const cookieStore = await cookies();
  const v = cookieStore.get('fw_verified')?.value;
  if (v !== 'true') {
    return NextResponse.json({ ok: false, code: 'NOT_VERIFIED' }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const guard = await requireVerifiedCookie();
  if (guard) return guard;

  const body = await req.json();
  const id = createReferenceId();
  const session = await auth();
  const ownerWalletAddress = session?.user?.walletAddress ?? undefined;

  const item = store.upsertRequest({
    id,
    manager: (body.manager as string | undefined) ?? '0x0000000000000000000000000000000000000000',
    title: String(body.title ?? 'Untitled Request'),
    description: String(body.description ?? ''),
    budgetToken: body.budgetToken === 'WLD' ? 'WLD' : 'USDC',
    budgetAmount: String(body.budgetAmount ?? '0'),
    ownerWalletAddress,
    createdAt: Date.now(),
  });

  // Persist to Mongo (best-effort)
  try {
    const db = await getDb();
    await db.collection('requests').updateOne(
      { id: item.id },
      { $set: item },
      { upsert: true },
    );
  } catch (e) {
    // non-fatal
  }

  return NextResponse.json({ ok: true, request: item });
}

export async function GET() {
  let items = store.listRequests(50);
  // Try to hydrate from Mongo
  try {
    const db = await getDb();
    const docs = (await db.collection('requests').find({}, { limit: 50, sort: { createdAt: -1 } }).toArray()) as any[];
    if (docs?.length) items = docs as any;
  } catch (e) {
    // non-fatal
  }
  return NextResponse.json({ ok: true, items });
}


