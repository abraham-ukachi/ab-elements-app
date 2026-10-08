import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';


// create abElements' Vitest config as the default export (unit tests only)
export default defineConfig({
  resolve: {
    // mirror the `@/*` path alias of tsconfig.json
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) },
      // `server-only` throws outside React Server Components (see tests/unit/stubs/server-only.ts)
      { find: /^server-only$/, replacement: fileURLToPath(new URL('./tests/unit/stubs/server-only.ts', import.meta.url)) },
    ],
  },

  test: {
    // unit tests live in `tests/unit` (end-to-end tests will get their own folder)
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
