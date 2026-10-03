import type { NextConfig } from 'next';


// create abElements' Next.js config as `nextConfig`
const nextConfig: NextConfig = {
  // the Ab packages ship TypeScript sources, so let Next.js compile them
  transpilePackages: [
    'ab-nextjs-fonts',
    'ab-nextjs-icons',
    'ab-nextjs-animations',
    'ab-nextjs-theme',
    'ab-nextjs-hooks',
    'ab-nextjs-core',
    'ab-nextjs-components',
  ],
};


export default nextConfig;
