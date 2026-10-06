import type { NextConfig } from 'next';
import { withAbI18n } from 'ab-nextjs-i18n/plugin';


// create abElements' Next.js config as `nextConfig`
const nextConfig: NextConfig = {
  // the Ab packages ship TypeScript sources, so let Next.js compile them
  // (`withAbI18n` also adds `ab-nextjs-i18n` to this list)
  transpilePackages: [
    'ab-nextjs-fonts',
    'ab-nextjs-icons',
    'ab-nextjs-animations',
    'ab-nextjs-theme',
    'ab-nextjs-hooks',
    'ab-nextjs-core',
    'ab-nextjs-components',
  ],
  experimental: {
    // root 404 for unmatched URLs when the root layout is under `app/[locale]`
    globalNotFound: true,
  },
};


export default withAbI18n(nextConfig);
