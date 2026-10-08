// next-intl request config (found automatically by `withAbI18n` / next-intl's plugin).
import { createAbRequestConfig } from 'ab-nextjs-i18n/server';
import * as rootParams from 'next/root-params';
import abI18nConfig from './config';

export default createAbRequestConfig({
  config: abI18nConfig,
  // Keep this `import()` here so next-intl's (opt-in) precompile loader can see the JSON files.
  loadMessages: async (locale) => (await import(`../messages/${locale}.json`)).default,
  // The locale of `app/[locale]/layout.tsx` (it must be the root layout: no `app/layout.tsx`).
  // Pages render statically without `setAbRequestLocale`. Server Actions and Route Handlers
  // (no root params yet) fall back to the locale the proxy detected.
  rootParam: () => rootParams.locale(),
});
