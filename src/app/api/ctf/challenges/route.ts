import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { encryptRegexFlag, hashStaticFlag } from '@/lib/flag-security';
import { prisma } from '@/lib/prisma';

function validFlags(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
  const flags = value.filter((flag): flag is Record<string, unknown> => typeof flag === 'object' && flag !== null);
  if (flags.length !== value.length || flags.some(flag => !['STATIC', 'REGEX'].includes(String(flag.type)) || typeof flag.content !== 'string' || flag.content.length < 1 || flag.content.length > 512)) return null;
  return flags;
}

function persistFlags(flags: Record<string, unknown>[]) {
  return flags.map(flag => {
    const type = flag.type as 'STATIC' | 'REGEX';
    const caseSensitive = flag.caseSensitive !== false;
    return { type, caseSensitive, isSensitive: true, content: type === 'STATIC' ? hashStaticFlag(flag.content as string, caseSensitive) : encryptRegexFlag(flag.content as string) };
  });
}

function validHints(value: unknown) {
  if (!Array.isArray(value) || value.length > 20) return null;
  if (value.some(hint => typeof hint !== 'object' || hint === null || typeof hint.content !== 'string' || hint.content.length > 5000 || !Number.isInteger(hint.cost) || hint.cost < 0)) return null;
  return value as Array<{ content: string; cost: number }>;
}

export async function POST(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const flags = validFlags(body.flags);
  const hints = validHints(body.hints ?? []);
  const eventId = typeof body.eventId === 'string' ? body.eventId : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!flags || !hints || !eventId || !title || title.length > 160 || typeof body.description !== 'string' || body.description.length > 20_000 || !['STANDARD', 'DYNAMIC'].includes(String(body.type))) return NextResponse.json({ error: 'Invalid challenge details or flag configuration.' }, { status: 400 });
  const parentEvent = await prisma.event.findFirst({ where: { id: eventId, type: 'CTF' }, select: { id: true } });
  if (!parentEvent) return NextResponse.json({ error: 'Challenges must belong to a CTF event.' }, { status: 400 });
  try {
    const challenge = await prisma.challenge.create({ data: {
      eventId, title, category: String(body.category), description: body.description,
      type: body.type as 'STANDARD' | 'DYNAMIC', initialPoints: Number(body.initialPoints), minPoints: Number(body.minPoints),
      decaySolves: Number(body.decaySolves), currentPoints: Number(body.initialPoints), state: body.state === 'hidden' ? 'hidden' : 'visible',
      maxAttempts: Number(body.maxAttempts ?? 0), tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 20) : [],
      flags: { create: persistFlags(flags) }, hints: { create: hints },
    }, include: { flags: true, hints: true } });
    return NextResponse.json({ challenge: { ...challenge, flags: challenge.flags.map(flag => ({ ...flag, content: '' })) } }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') return NextResponse.json({ error: 'Select a valid event for this challenge.' }, { status: 400 });
    throw error;
  }
}

export async function PATCH(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Challenge id is required.' }, { status: 400 });
  const flags = body.flags === undefined ? undefined : validFlags(body.flags);
  const hints = body.hints === undefined ? undefined : validHints(body.hints);
  if ((body.flags !== undefined && !flags) || (body.hints !== undefined && !hints)) return NextResponse.json({ error: 'Invalid flag or hint configuration.' }, { status: 400 });
  if (body.state !== undefined && body.state !== 'visible' && body.state !== 'hidden') return NextResponse.json({ error: 'Invalid challenge visibility.' }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const key of ['title', 'category', 'description', 'state', 'type', 'initialPoints', 'minPoints', 'decaySolves'] as const) if (body[key] !== undefined) data[key] = body[key];
  if (flags) data.flags = { deleteMany: {}, create: persistFlags(flags) };
  if (hints) data.hints = { deleteMany: {}, create: hints };
  const challenge = await prisma.challenge.update({ where: { id: body.id }, data, include: { flags: true, hints: true } });
  return NextResponse.json({ challenge: { ...challenge, flags: challenge.flags.map(flag => ({ ...flag, content: '' })) } });
}

export async function DELETE(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Challenge id is required.' }, { status: 400 });
  await prisma.challenge.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
