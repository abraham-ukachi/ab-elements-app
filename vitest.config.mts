/* 
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElments Project.
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
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
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


// create abElements' Vitest config as the default export (unit tests only)
export default defineConfig({
  /* Resolve */
  resolve: {
    // mirror the `@/*` path alias of tsconfig.json
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) },
      // `server-only` throws outside React Server Components (see tests/unit/stubs/server-only.ts)
      { find: /^server-only$/, replacement: fileURLToPath(new URL('./tests/unit/stubs/server-only.ts', import.meta.url)) },
    ],
  },

  /* Test */
  test: {
    // unit tests live in `tests/unit` (end-to-end tests will get their own folder)
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    // run them in Node.js (no DOM needed yet)
    environment: 'node',
  },
});
