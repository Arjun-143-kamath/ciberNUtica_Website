import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  const isAdmin = session?.role === 'ADMIN';
  const [challenges, solves, users, submissions, hintUnlocks, settings] = await Promise.all([
    prisma.challenge.findMany({ where: isAdmin ? {} : { state: 'visible', event: { isPublished: true } }, include: { flags: true, hints: true, event: { select: { isPublished: true } } }, orderBy: { createdAt: 'asc' } }),
    prisma.solve.findMany({ where: isAdmin ? {} : { challenge: { state: 'visible', event: { isPublished: true } } }, include: { user: { select: { username: true } }, challenge: { select: { title: true } } }, orderBy: { createdAt: 'asc' } }),
    prisma.user.findMany({ where: { role: 'USER' }, select: { id: true, username: true, teamName: true, role: true } }),
    session ? prisma.submission.findMany({ where: isAdmin ? {} : { userId: session.id }, include: { user: { select: { username: true } }, challenge: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: isAdmin ? 500 : 100 }) : Promise.resolve([]),
    session ? prisma.hintUnlock.findMany({ where: { userId: session.id } }) : Promise.resolve([]),
    prisma.platformSettings.findUnique({ where: { id: 'global' } }),
  ]);
  return NextResponse.json({
    challenges: challenges.map(challenge => ({
      ...challenge,
      event: undefined,
      files: Array.isArray(challenge.files) ? challenge.files : undefined,
      flags: isAdmin ? challenge.flags.map(flag => ({ id: flag.id, challengeId: flag.challengeId, type: flag.type, content: '', caseSensitive: flag.caseSensitive })) : [],
      hints: challenge.hints.map(hint => ({ ...hint, content: isAdmin || hintUnlocks.some(unlock => unlock.hintId === hint.id) ? hint.content : '' })),
    })),
    solves: solves.filter(solve => !settings?.isScoreboardFrozen || isAdmin || solve.userId === session?.id).map(solve => ({ id: solve.id, userId: solve.userId, username: solve.user.username, challengeId: solve.challengeId, challengeTitle: solve.challenge.title, pointsAwarded: solve.pointsAwarded, solvedAt: solve.createdAt.toISOString() })),
    users,
    submissions: submissions.map(submission => ({ id: submission.id, userId: submission.userId, username: submission.user.username, challengeId: submission.challengeId, challengeTitle: submission.challenge.title, providedFlag: submission.providedFlag, isCorrect: submission.isCorrect, submittedAt: submission.createdAt.toISOString() })),
    unlockedHints: hintUnlocks.map(unlock => ({ userId: unlock.userId, challengeId: unlock.challengeId, hintId: unlock.hintId, cost: unlock.cost })),
    isScoreboardFrozen: settings?.isScoreboardFrozen ?? false,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
