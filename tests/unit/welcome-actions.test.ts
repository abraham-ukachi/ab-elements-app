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
* @name: abElements Welcome Actions Tests
* @file: tests/unit/welcome-actions.test.ts
* @type: TypeScript (Vitest)
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


// 🧪 Welcome server action: `completeWelcome` says hello (1 year) and goes home, in the right locale.

// import the test helpers from `vitest` 🧪
import { beforeEach, describe, expect, it, vi } from 'vitest';

// mock the hello cookie action (no request scope in unit tests 🍪)
vi.mock('ab-nextjs-hooks/server/useAbApp', () => ({
  // the real cookie lifetimes (hooks 0.1.6: 7 days by default, 1 year for the Welcome) 📅
  AB_APP_COOKIE_MAX_AGE: { oneWeek: 604800, oneYear: 31536000 },
  // a spy for the hello cookie action 🍪
  toggleAppHello: vi.fn(async (state?: boolean) => state ?? false),
}));
// mock `redirect` (the real one throws NEXT_REDIRECT 🚦)
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

// import the mocks
import { toggleAppHello } from 'ab-nextjs-hooks/server/useAbApp';
import { redirect } from 'next/navigation';
// import the action under test 🎬
import { completeWelcome } from '@/app/[locale]/welcome/actions';


// build the Get Started form data 📝
const form = (locale?: string): FormData => {
  // the form
  const data = new FormData();
  // the hidden `locale` field (if any)
  if (locale !== undefined) data.set('locale', locale);
  // done
  return data;
};


describe('app/[locale]/welcome/actions: completeWelcome 🍪', () => {
  // fresh mocks for every test
  beforeEach(() => vi.clearAllMocks());

  it('sets the hello cookie to true for one year (31536000 s)', async () => {
    await completeWelcome(form('en'));
    expect(toggleAppHello).toHaveBeenCalledWith(true, { maxAge: 31536000 });
  });

  it('redirects to `/` for the default locale (en) 🏠', async () => {
    await completeWelcome(form('en'));
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('redirects to the localized home page (`/fr`, `/ru`) 🌍', async () => {
    await completeWelcome(form('fr'));
    expect(redirect).toHaveBeenLastCalledWith('/fr');
    await completeWelcome(form('ru'));
    expect(redirect).toHaveBeenLastCalledWith('/ru');
  });

  it('falls back to `/` for a missing or unknown locale (no open redirect 🛡️)', async () => {
    await completeWelcome(form());
    expect(redirect).toHaveBeenLastCalledWith('/');
    await completeWelcome(form('//evil.example'));
    expect(redirect).toHaveBeenLastCalledWith('/');
  });

  it('sets the cookie BEFORE redirecting', async () => {
    await completeWelcome(form('es'));
    expect(vi.mocked(toggleAppHello).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(redirect).mock.invocationCallOrder[0]);
  });
});
