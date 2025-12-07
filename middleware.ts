import {intlMiddleware} from '@/lib/i18n/middleware';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = { matcher: ['/', '/(es|en)/:path*'] };
