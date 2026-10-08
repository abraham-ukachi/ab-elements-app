// Next.js 16 proxy (formerly middleware): locale detection and redirects (it reads NEXT_LOCALE, never writes it).
// To add an auth guard, pass `onRequest` (see the ab-nextjs-i18n README, "Proxy (with auth)").
import { createAbI18nProxy } from 'ab-nextjs-i18n/proxy';
import abI18nConfig from './i18n/config';

export default createAbI18nProxy(abI18nConfig);

export const config = {
  // Everything except API routes, Next.js / Vercel internals and files with an extension.
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
