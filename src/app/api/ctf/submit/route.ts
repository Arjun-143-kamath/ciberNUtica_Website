import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hashStaticFlag, verifyStoredFlags } from '@/lib/flag-security';
import { allowAuthAttempt, requestIp } from '@/lib/rate-limit';
import { calculateDynamicPoints } from '@/lib/ctf-engine';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== 'USER') return NextResponse.json({ success: false, message: 'AUTHENTICATION_REQUIRED: Sign in as a competitor first.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ success: false, message: 'Invalid origin.' }, { status: 403 });
  let body: { challengeId?: unknown; flag?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 }); }
  const challengeId = typeof body.challengeId === 'string' ? body.challengeId : '';
  const flagText = typeof body.flag === 'string' ? body.flag.slice(0, 512).trim() : '';
  if (!challengeId || !flagText) return NextResponse.json({ success: false, message: 'A challenge and flag are required.' }, { status: 400 });
  if (!allowAuthAttempt(`flag-ip:${requestIp(request)}:${challengeId}`)) return NextResponse.json({ success: false, message: 'RATE_LIMIT_EXCEEDED: Maximum 5 attempts per minute.' }, { status: 429 });
  if (!allowAuthAttempt(`flag-user:${user.id}:${challengeId}`)) return NextResponse.json({ success: false, message: 'RATE_LIMIT_EXCEEDED: Maximum 5 attempts per minute.' }, { status: 429 });

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, include: { flags: true, event: true } });
  if (!challenge || challenge.state !== 'visible') return NextResponse.json({ success: false, message: 'CHALLENGE_NOT_FOUND: Invalid challenge identifier.' }, { status: 404 });
  if (!challenge.event.isPublished || !challenge.event.isLiveCTF || new Date() < challenge.event.startTime || new Date() > challenge.event.endTime) return NextResponse.json({ success: false, message: 'EVENT_INACTIVE: This CTF is not accepting submissions.' }, { status: 403 });
  const since = new Date(Date.now() - 60_000);
  const [attempts, existingSolve] = await Promise.all([
    prisma.submission.count({ where: { userId: user.id, challengeId, createdAt: { gte: since } } }),
    prisma.solve.findUnique({ where: { userId_challengeId: { userId: user.id, challengeId } } }),
  ]);
  if (attempts >= 5) return NextResponse.json({ success: false, message: 'RATE_LIMIT_EXCEEDED: Maximum 5 attempts per minute.' }, { status: 429 });
  if (existingSolve) return NextResponse.json({ success: false, message: 'DUPLICATE_SOLVE: You have already captured this flag.' }, { status: 409 });
  const isCorrect = verifyStoredFlags(flagText, challenge.flags);
  const auditHash = hashStaticFlag(flagText, true);
  try {
    const result = await prisma.$transaction(async tx => {
      const previousSolves = await tx.solve.count({ where: { challengeId } });
      await tx.submission.create({ data: { userId: user.id, challengeId, providedFlag: auditHash, isCorrect, ipAddress: requestIp(request).slice(0, 64) } });
      if (!isCorrect) return { success: false, message: 'INCORRECT_FLAG: Access denied.' };
      const pointsAwarded = challenge.type === 'DYNAMIC'
        ? calculateDynamicPoints(challenge.initialPoints, challenge.minPoints, challenge.decaySolves, previousSolves)
        : challenge.initialPoints;
      await tx.solve.create({ data: { userId: user.id, challengeId, pointsAwarded } });
      const currentPoints = challenge.type === 'DYNAMIC'
        ? calculateDynamicPoints(challenge.initialPoints, challenge.minPoints, challenge.decaySolves, previousSolves + 1)
        : challenge.initialPoints;
      await tx.challenge.update({ where: { id: challengeId }, data: { currentPoints } });
      return { success: true, message: 'FLAG_VERIFIED: Access granted. Points recorded on scoreboard.', pointsAwarded };
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json(result);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error.code === 'P2002' || error.code === 'P2034')) return NextResponse.json({ success: false, message: 'DUPLICATE_SOLVE: You have already captured this flag.' }, { status: 409 });
    throw error;
  }
}
