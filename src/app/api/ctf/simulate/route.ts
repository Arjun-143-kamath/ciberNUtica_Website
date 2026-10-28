import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hashStaticFlag } from '@/lib/flag-security';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  let body: { challengeId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.challengeId !== 'string') return NextResponse.json({ error: 'Challenge id required.' }, { status: 400 });
  const challenge = await prisma.challenge.findUnique({ where: { id: body.challengeId } });
  if (!challenge) return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  await prisma.submission.createMany({ data: Array.from({ length: 6 }, (_, index) => ({ userId: admin.id, challengeId: challenge.id, providedFlag: hashStaticFlag(`ciberNUtica{simulation_${index}_${Date.now()}}`, true), isCorrect: false })) });
  return NextResponse.json({ ok: true });
}
