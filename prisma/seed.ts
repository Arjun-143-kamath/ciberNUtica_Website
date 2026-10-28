import { createCipheriv, createHmac, randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';
import { INITIAL_BLOGS, INITIAL_CHALLENGES, INITIAL_EVENTS } from '../src/lib/initial-data';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

function eventDate(date: string, time: string) {
  const parsed = new Date(`${date} ${time.replace(/\s*UTC$/i, '')} UTC`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function postDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function hashFlag(content: string, caseSensitive: boolean) {
  const pepper = process.env.FLAG_PEPPER;
  if (!pepper || pepper.length < 32) throw new Error('Set FLAG_PEPPER to at least 32 random characters before seeding CTF flags.');
  return createHmac('sha256', pepper).update(caseSensitive ? content : content.toLowerCase()).digest('hex');
}

function encryptRegex(pattern: string) {
  const pepper = process.env.FLAG_PEPPER;
  if (!pepper || pepper.length < 32) throw new Error('Set FLAG_PEPPER to at least 32 random characters before seeding CTF flags.');
  const key = createHmac('sha256', pepper).update('ciberNUtica regex flag encryption v1').digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(pattern, 'utf8'), cipher.final()]);
  return `enc:v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;
}

function storeFlag(content: string, type: string, caseSensitive: boolean) {
  return type === 'STATIC' ? hashFlag(content, caseSensitive) : encryptRegex(content);
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters before seeding.');
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64) as Buffer;
  const admin = await prisma.user.upsert({
    where: { email },
    create: { id: 'user-admin', username: 'admin', name: 'Command Staff', email, passwordHash: `${salt.toString('base64url')}.${hash.toString('base64url')}`, role: 'ADMIN', teamName: 'Command Staff' },
    update: { role: 'ADMIN', passwordHash: `${salt.toString('base64url')}.${hash.toString('base64url')}` }
  });

  for (const event of INITIAL_EVENTS) {
    const data = {
      title: event.title, slug: event.slug, description: event.description,
      type: event.type === 'TALK' ? 'SPEAKER' as const : event.type,
      location: event.location, bannerUrl: event.bannerUrl,
      startTime: eventDate(event.date, event.startTime), endTime: eventDate(event.date, event.endTime),
      isPublished: event.isPublished, isLiveCTF: event.isLiveCTF,
      freezeTime: event.freezeTime ? new Date(event.freezeTime) : null,
    };
    await prisma.event.upsert({ where: { id: event.id }, create: { id: event.id, ...data }, update: data });
  }

  for (const post of INITIAL_BLOGS) {
    const data = {
      title: post.title, summary: post.summary, content: post.content, category: post.category,
      coverImage: post.coverImage ?? null, authorId: admin.id, authorName: post.authorName,
      authorRole: post.authorRole, isPublished: true, createdAt: postDate(post.publishedAt),
    };
    await prisma.blogPost.upsert({ where: { slug: post.slug }, create: { id: post.id, slug: post.slug, ...data }, update: data });
  }

  for (const challenge of INITIAL_CHALLENGES) {
    const data = {
      eventId: challenge.eventId, title: challenge.title, category: challenge.category,
      description: challenge.description, type: challenge.type, initialPoints: challenge.initialPoints,
      minPoints: challenge.minPoints, decaySolves: challenge.decaySolves, currentPoints: challenge.currentPoints,
      state: challenge.state, maxAttempts: challenge.maxAttempts, tags: challenge.tags ?? [],
      files: challenge.files ?? undefined,
    };
    const existing = await prisma.challenge.findUnique({ where: { id: challenge.id } });
    if (existing) {
      await prisma.$transaction([
        prisma.flag.deleteMany({ where: { challengeId: challenge.id } }),
        prisma.hint.deleteMany({ where: { challengeId: challenge.id } }),
        prisma.challenge.update({ where: { id: challenge.id }, data: {
          ...data,
          flags: { create: challenge.flags.map(flag => ({ type: flag.type, content: storeFlag(flag.content, flag.type, flag.caseSensitive), caseSensitive: flag.caseSensitive })) },
          hints: { create: challenge.hints.map(hint => ({ content: hint.content, cost: hint.cost })) },
        } })
      ]);
    } else {
      await prisma.challenge.create({ data: {
        id: challenge.id, ...data,
        flags: { create: challenge.flags.map(flag => ({ type: flag.type, content: storeFlag(flag.content, flag.type, flag.caseSensitive), caseSensitive: flag.caseSensitive })) },
        hints: { create: challenge.hints.map(hint => ({ content: hint.content, cost: hint.cost })) },
      } });
    }
  }
}

main().then(() => console.log('Database seeded with administrator, events, dispatches, and challenges.'))
  .catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
