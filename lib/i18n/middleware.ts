import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './config';

export const intlMiddleware = createMiddleware({
  locales: Array.from(locales),
  defaultLocale,
  localePrefix: 'always'
});

export const i18nMatcher = ['/', '/(es|en)/:path*'];

export default intlMiddleware;
