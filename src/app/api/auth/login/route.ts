import { NextRequest, NextResponse } from 'next/server';
import { authCookie, authenticateAccount, createSessionToken } from '@/lib/auth';
import { allowAuthAttempt, requestIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!allowAuthAttempt(`login:${requestIp(request)}`)) return NextResponse.json({ error: 'Too many sign-in attempts. Try again in one minute.' }, { status: 429 });

  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const user = await authenticateAccount(email, password);
  if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

  const response = NextResponse.json({ user });
  response.cookies.set(authCookie.name, createSessionToken(user), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/', maxAge: authCookie.maxAge
  });
  return response;
}
