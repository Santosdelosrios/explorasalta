import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './config';

export default createMiddleware({
  locales: Array.from(locales),
  defaultLocale,
  localePrefix: 'always'
});

export const i18nMatcher = ['/', '/(es|en)/:path*'];
