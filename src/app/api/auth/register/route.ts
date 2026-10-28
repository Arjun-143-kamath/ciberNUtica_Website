import { NextRequest, NextResponse } from 'next/server';
import { authCookie, createSessionToken, registerAccount } from '@/lib/auth';
import { allowAuthAttempt, requestIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!allowAuthAttempt(`register:${requestIp(request)}`, 5, 60 * 60 * 1000)) return NextResponse.json({ error: 'Too many account creation attempts. Try again later.' }, { status: 429 });
  let body: { username?: unknown; email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof body.username !== 'string' || typeof body.email !== 'string' || typeof body.password !== 'string') return NextResponse.json({ error: 'Enter a username, email, and password.' }, { status: 400 });
  try {
    const user = await registerAccount({ username: body.username, email: body.email, password: body.password });
    if (!user) return NextResponse.json({ error: 'Account details are invalid or already in use. Usernames must be 3–24 letters, numbers, or underscores; passwords must be 12–128 characters.' }, { status: 400 });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(authCookie.name, createSessionToken(user), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: authCookie.maxAge });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to create the account. Please try again.' }, { status: 500 });
  }
}
