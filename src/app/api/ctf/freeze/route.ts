import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: { frozen?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.frozen !== 'boolean') return NextResponse.json({ error: 'Invalid freeze state.' }, { status: 400 });
  const settings = await prisma.platformSettings.upsert({ where: { id: 'global' }, create: { id: 'global', isScoreboardFrozen: body.frozen }, update: { isScoreboardFrozen: body.frozen } });
  return NextResponse.json({ isScoreboardFrozen: settings.isScoreboardFrozen });
}
