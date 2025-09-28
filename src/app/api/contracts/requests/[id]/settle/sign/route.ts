import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: false, code: 'REMOVED' }, { status: 410 });
}


