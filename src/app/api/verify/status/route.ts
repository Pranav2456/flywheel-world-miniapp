import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const verified = cookieStore.get('fw_verified')?.value === 'true';
  const level = cookieStore.get('fw_verified_level')?.value ?? null;
  return NextResponse.json({ ok: true, verified, level });
}


