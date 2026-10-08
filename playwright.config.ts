import { defineConfig } from '@playwright/test';


// the port of the production server the e2e tests run against
// (3000 is left free for `pnpm dev`; override it with `E2E_PORT`)
const PORT: number = Number(process.env.E2E_PORT) || 3020;
const BASE_URL: string = `http://localhost:${PORT}`;


// create abElements' Playwright config as the default export (end-to-end tests only)
export default defineConfig({
  // end-to-end tests live in `tests/e2e` (unit tests are Vitest's, in `tests/unit`)
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: BASE_URL,
  },

  // serve the production build (run `pnpm build` first): the headers & the proxy behave as on Vercel
  webServer: {
    command: `pnpm start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
