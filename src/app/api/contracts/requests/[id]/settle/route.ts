import { NextResponse } from 'next/server';
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

  const { returnAmount } = await req.json();
  const { params } = context as { params: { id: string } };
  // For hackathon: compute commission client-side and return mock tx
  const gross = BigInt(returnAmount ?? '0');
  const commissionBps = BigInt(1000); // 10% demo
  const commission = (gross * commissionBps) / BigInt(10000);
  const requesterAmount = gross - commission;

  return NextResponse.json({
    ok: true,
    settlement: {
      gross: gross.toString(),
      commission: commission.toString(),
      requesterAmount: requesterAmount.toString(),
    },
    txHash: '0x' + '0'.repeat(64),
    requestId: params.id,
  });
}


