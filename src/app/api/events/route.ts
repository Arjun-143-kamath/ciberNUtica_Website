import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function toEvent(event: { id: string; title: string; slug: string; description: string; type: string; location: string | null; bannerUrl: string | null; startTime: Date; endTime: Date; isPublished: boolean; isLiveCTF: boolean; freezeTime: Date | null }) {
  const date = event.startTime.toISOString().slice(0, 10);
  return {
    id: event.id, title: event.title, slug: event.slug, description: event.description,
    type: event.type === 'SPEAKER' ? 'TALK' : event.type, location: event.location ?? '',
    date: event.startTime.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).toUpperCase(),
    startTime: `${event.startTime.toISOString().slice(11, 16)} UTC`, endTime: `${event.endTime.toISOString().slice(11, 16)} UTC`,
    startDate: date, bannerUrl: event.bannerUrl ?? undefined, isPublished: event.isPublished,
    endDate: event.endTime.toISOString().slice(0, 10),
    isLiveCTF: event.isLiveCTF, freezeTime: event.freezeTime?.toISOString(),
  };
}

export async function GET() {
  const admin = await getAdminSession();
  const events = await prisma.event.findMany({ where: admin ? {} : { isPublished: true }, orderBy: { startTime: 'asc' } });
  return NextResponse.json({ events: events.map(toEvent) }, { headers: { 'Cache-Control': 'no-store' } });
}

function parseEventTimes(date: unknown, timeRange: unknown, endTime: unknown, endDate?: unknown) {
  if (typeof date !== 'string' || typeof timeRange !== 'string') return null;
  const datePart = new Date(`${date} UTC`);
  if (Number.isNaN(datePart.getTime())) return null;
  const range = timeRange.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})(?:\s+UTC)?$/i);
  const startText = range?.[1] ?? timeRange.match(/^(\d{1,2}:\d{2})(?:\s+UTC)?$/i)?.[1];
  const endText = range?.[2] ?? (typeof endTime === 'string' ? endTime.match(/^(\d{1,2}:\d{2})(?:\s+UTC)?$/i)?.[1] : undefined);
  if (!startText || !endText) return null;
  const day = datePart.toISOString().slice(0, 10);
  const start = new Date(`${day}T${startText.padStart(5, '0')}:00.000Z`);
  const endDay = typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : day;
  const end = new Date(`${endDay}T${endText.padStart(5, '0')}:00.000Z`);
  return Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ? null : { start, end };
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const times = parseEventTimes(body.date, body.startTime, body.endTime, body.endDate);
  if (!title || title.length > 160 || !description || !times || times.end <= times.start) return NextResponse.json({ error: 'Enter a title, description, and valid event times.' }, { status: 400 });
  const type = ['WORKSHOP', 'SESSION', 'CTF'].includes(String(body.type)) ? String(body.type) : String(body.type) === 'TALK' ? 'SPEAKER' : null;
  if (!type) return NextResponse.json({ error: 'Invalid event type.' }, { status: 400 });
  const slug = (typeof body.slug === 'string' ? body.slug : title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
  try {
    const event = await prisma.event.create({ data: { title, slug, description, type: type as 'WORKSHOP' | 'SESSION' | 'CTF' | 'SPEAKER', location: typeof body.location === 'string' ? body.location.slice(0, 200) : null, bannerUrl: typeof body.bannerUrl === 'string' ? body.bannerUrl.slice(0, 2048) : null, startTime: times.start, endTime: times.end, isPublished: body.isPublished !== false, isLiveCTF: body.isLiveCTF === true } });
    return NextResponse.json({ event: toEvent(event) }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'An event already uses that URL slug.' }, { status: 409 });
    throw error;
  }
}

export async function PATCH(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Invalid event update.' }, { status: 400 });
  const existing = await prisma.event.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  const data: { isLiveCTF?: boolean; isPublished?: boolean; title?: string; description?: string; startTime?: Date; endTime?: Date } = {};
  if (body.isLiveCTF !== undefined) {
    if (typeof body.isLiveCTF !== 'boolean') return NextResponse.json({ error: 'Invalid live state.' }, { status: 400 });
    data.isLiveCTF = body.isLiveCTF;
  }
  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== 'boolean') return NextResponse.json({ error: 'Invalid visibility state.' }, { status: 400 });
    data.isPublished = body.isPublished;
  }
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 160) return NextResponse.json({ error: 'Enter a valid event title.' }, { status: 400 });
    data.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.length > 5000) return NextResponse.json({ error: 'Enter a valid event description.' }, { status: 400 });
    data.description = body.description.trim();
  }
  if (body.date !== undefined || body.startTime !== undefined || body.endTime !== undefined || body.endDate !== undefined) {
    const times = parseEventTimes(body.date ?? existing.startTime.toISOString().slice(0, 10), body.startTime ?? `${existing.startTime.toISOString().slice(11, 16)} UTC`, body.endTime ?? `${existing.endTime.toISOString().slice(11, 16)} UTC`, body.endDate ?? existing.endTime.toISOString().slice(0, 10));
    if (!times || times.end <= times.start) return NextResponse.json({ error: 'Enter valid event times.' }, { status: 400 });
    data.startTime = times.start;
    data.endTime = times.end;
  }
  const event = await prisma.event.update({ where: { id: body.id }, data });
  return NextResponse.json({ event: toEvent(event) });
}
