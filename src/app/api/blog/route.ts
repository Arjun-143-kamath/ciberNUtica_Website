import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function toBlogPost(post: {
  id: string; title: string; slug: string; summary: string; content: string; category: string;
  coverImage: string | null; createdAt: Date; authorName: string | null; authorRole: string | null;
  author: { username: string; role: 'ADMIN' | 'USER' };
}) {
  const words = post.content.trim().split(/\s+/).filter(Boolean).length;
  return {
    id: post.id, title: post.title, slug: post.slug, summary: post.summary, content: post.content,
    category: post.category, authorName: post.authorName ?? post.author.username,
    authorRole: post.authorRole ?? (post.author.role === 'ADMIN' ? 'Command Staff' : 'Research Analyst'),
    readTime: `${Math.max(1, Math.ceil(words / 200))} min read`,
    publishedAt: post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
    coverImage: post.coverImage ?? undefined,
  };
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, include: { author: { select: { username: true, role: true } } }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ posts: posts.map(toBlogPost) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const slugInput = typeof body.slug === 'string' ? body.slug : title;
  const slug = slugInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
  const coverImage = typeof body.coverImage === 'string' && body.coverImage.length < 2048 ? body.coverImage : null;
  if (!title || title.length > 160 || !summary || summary.length > 500 || !content.trim() || content.length > 100_000 || !category || category.length > 64 || !slug) {
    return NextResponse.json({ error: 'Check the title, summary, category, and article content.' }, { status: 400 });
  }
  try {
    const created = await prisma.blogPost.create({ data: { title, slug, summary, content, category, coverImage, authorId: admin.id, authorName: admin.username, authorRole: 'Command Staff', isPublished: true }, include: { author: { select: { username: true, role: true } } } });
    return NextResponse.json({ post: toBlogPost(created) }, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'A dispatch already uses that URL slug.' }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 });
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Blog post id is required.' }, { status: 400 });
  await prisma.blogPost.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
