import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'USER') return NextResponse.json({ error: 'Competitor authentication required.' }, { status: 401 });
  let body: { challengeId?: unknown; hintId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.challengeId !== 'string' || typeof body.hintId !== 'string') return NextResponse.json({ error: 'Invalid hint.' }, { status: 400 });
  const hint = await prisma.hint.findFirst({ where: { id: body.hintId, challengeId: body.challengeId, challenge: { state: 'visible', event: { isPublished: true } } } });
  if (!hint) return NextResponse.json({ error: 'Hint not found.' }, { status: 404 });
  const unlock = await prisma.hintUnlock.upsert({ where: { userId_hintId: { userId: user.id, hintId: hint.id } }, create: { userId: user.id, challengeId: body.challengeId, hintId: hint.id, cost: hint.cost }, update: {} });
  return NextResponse.json({ success: true, message: 'Hint unlocked.', cost: unlock.cost, content: hint.content });
}
