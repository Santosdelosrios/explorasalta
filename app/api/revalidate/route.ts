import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const { tag } = await req.json();
  if (!tag) return NextResponse.json({ ok: false, error: 'Missing tag' }, { status: 400 });
  const revalidate = revalidateTag as (tag: string) => void;
  revalidate(tag);
  return NextResponse.json({ ok: true });
}
