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
* @name: Playwright Configuration File
* @file: playwright.config.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm test:e2e
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// import `defineConfig` from `@playwright/test` 🎭
import { defineConfig } from '@playwright/test';


// the port of the production server the e2e tests run against
// (3000 is left free for `pnpm dev`; override it with `E2E_PORT`)
const PORT: number = Number(process.env.E2E_PORT) || 3020;
// the base URL of that server 🔗
const BASE_URL: string = `http://localhost:${PORT}`;


// create abElements' Playwright config as the default export (end-to-end tests only)
export default defineConfig({
  /* Tests */
  // end-to-end tests live in `tests/e2e` (unit tests are Vitest's, in `tests/unit`)
  testDir: './tests/e2e',
  // only the `*.spec.ts` files
  testMatch: '**/*.spec.ts',
  // run every test in parallel ⚡
  fullyParallel: true,
  // no `test.only` left behind on CI
  forbidOnly: !!process.env.CI,
  // one retry on CI, none locally
  retries: process.env.CI ? 1 : 0,
  // GitHub annotations on CI, a plain list locally
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  /* Use */
  use: {
    // every `request.get('/...')` goes to the server below
    baseURL: BASE_URL,
  },

  /* Web Server */
  // serve the production build (run `pnpm build` first): the headers & the proxy behave as on Vercel 🚀
  webServer: {
    // start it on our port
    command: `pnpm start --port ${PORT}`,
    // wait until it answers
    url: BASE_URL,
    // reuse a running server locally, never on CI
    reuseExistingServer: !process.env.CI,
    // give it a minute to boot
    timeout: 60_000,
  },
});
