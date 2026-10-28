import 'server-only';
import { createHmac, timingSafeEqual, randomBytes, randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { User } from './types';
import { prisma } from './prisma';

const COOKIE_NAME = 'cibernutica_session';
const SESSION_SECONDS = 60 * 60 * 8;
const scrypt = promisify(scryptCallback);

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be set to at least 32 characters.');
  return value;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(user: Pick<User, 'id' | 'username' | 'email' | 'role' | 'teamName'>) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export async function getSession(): Promise<User | null> {
  await connection();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.id !== 'string' || typeof data.username !== 'string' || typeof data.email !== 'string' || !['ADMIN', 'USER'].includes(data.role) || data.exp <= Date.now() / 1000) return null;
    if (data.role === 'ADMIN' && data.id !== 'user-admin') return null;
    if (data.role === 'USER' && !data.id.startsWith('usr-')) return null;
    return { id: data.id, username: data.username, email: data.email, role: data.role, teamName: typeof data.teamName === 'string' ? data.teamName : undefined, createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date(data.exp * 1000 - SESSION_SECONDS * 1000).toISOString() };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const user = await getSession();
  return user?.role === 'ADMIN' ? user : null;
}

export async function registerAccount(input: { username: string; email: string; password: string }): Promise<User | null> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.password.length < 12 || input.password.length > 128) return null;
  if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase() || username.toLowerCase() === 'admin') return null;
  const salt = randomBytes(16);
  const hash = await scrypt(input.password, salt, 64) as Buffer;
  try {
    const account = await prisma.user.create({ data: {
      id: `usr-${randomUUID()}`, username, name: username, email,
      passwordHash: `${salt.toString('base64url')}.${hash.toString('base64url')}`,
      teamName: username, role: 'USER'
    } });
    return { id: account.id, username: account.username, email: account.email, role: 'USER', teamName: account.teamName ?? undefined, createdAt: account.createdAt.toISOString() };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return null;
    throw error;
  }
}

export async function authenticateAccount(email: string, password: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const [storedSalt, storedHash] = account?.passwordHash.split('.') ?? [];
  const salt = storedSalt ? Buffer.from(storedSalt, 'base64url') : Buffer.alloc(16);
  const expected = storedHash ? Buffer.from(storedHash, 'base64url') : Buffer.alloc(64);
  const actual = await scrypt(password, salt, 64) as Buffer;
  if (!account || expected.length !== actual.length || !timingSafeEqual(actual, expected)) return null;
  return { id: account.id, username: account.username, email: account.email, role: account.role, teamName: account.teamName ?? undefined, createdAt: account.createdAt.toISOString() };
}

export const authCookie = { name: COOKIE_NAME, maxAge: SESSION_SECONDS };
