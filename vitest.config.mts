/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2026 Abraham Ukachi. The abElements Project.
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the 'Software'), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
* @project: ab-elements-app
* @name: Vitest Configuration File
* @file: vitest.config.mts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// import `fileURLToPath` from `node:url` (to resolve the aliases' absolute paths)
import { fileURLToPath } from 'node:url';
// import `defineConfig` from `vitest`
import { defineConfig } from 'vitest/config';
// import the Fumadocs MDX Vite plugin (compiles the `content/docs/*.mdx?collection=docs` imports) 📚
import mdx from 'fumadocs-mdx/vite';


// create abElements' Vitest config as the default export (unit tests only)
export default defineConfig({
  /* Plugins */
  // 📚 lib/source.ts (→ the sitemap, the docs pages) imports `collections/server`, i.e. the `.source/` index that
  //    `fumadocs-mdx` generates (postinstall / next build). That index imports every page as
  //    `*.mdx?collection=docs`, which plain Vite can't parse, so the plugin compiles them here too.
  //    `index: false`: reuse the generated `.source/` (never rewrite the one Next.js builds from) 🧱
  plugins: [mdx(import('./source.config'), { index: false })],
  /* Resolve */
  resolve: {
    // mirror the `@/*` path alias of tsconfig.json
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) },
      // mirror the `collections/*` path alias of tsconfig.json too: fumadocs-mdx's generated `.source/` 📚
      { find: /^collections\/(.*)$/, replacement: fileURLToPath(new URL('./.source/$1', import.meta.url)) },
      // `server-only` throws outside React Server Components (see tests/unit/stubs/server-only.ts)
      { find: /^server-only$/, replacement: fileURLToPath(new URL('./tests/unit/stubs/server-only.ts', import.meta.url)) },
    ],
  },

  /* CSS */
  // no Tailwind / PostCSS in unit tests: packaged CSS modules (e.g. `ab-nextjs-components/ab-splash`) load as-is 🎨
  css: { postcss: {} },

  /* Test */
  test: {
    // unit tests live in `tests/unit` (end-to-end tests will get their own folder)
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    // run them in Node.js (no DOM needed yet)
    environment: 'node',
    // bundle next-intl through Vite: its ESM imports `next/server` without the `.js` extension,
    // which Node's resolver refuses (the proxy.ts gate tests load the i18n proxy) 🧭
    server: { deps: { inline: ['next-intl'] } },
  },
});
