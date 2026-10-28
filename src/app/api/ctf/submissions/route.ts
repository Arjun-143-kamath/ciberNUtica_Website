import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  await prisma.submission.deleteMany();
  return NextResponse.json({ ok: true });
}
