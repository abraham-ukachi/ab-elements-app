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
* @name: abElements Metadata Tests
* @file: tests/unit/metadata.test.ts
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


// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import package.json, the default (en) messages & abElements' metadata
import pkg from '@/package.json';
import enMessages from '@/messages/en.json';
import { APP_DESCRIPTION, APP_URL, StaticMetadata } from '@/app/metadata';


// smoke test: the root metadata loads and shares its copy with the en messages & package.json
describe('app/metadata', () => {
  it('exposes the abElements root metadata', () => {
    // expect the app name & the metadata base (from `APP_URL`) ✅
    expect(StaticMetadata.applicationName).toBe('abElements');
    expect(StaticMetadata.metadataBase?.toString()).toBe(new URL(APP_URL).toString());
    // the title & description come from the `Metadata` messages (app/[locale]/layout.tsx)
    expect(StaticMetadata.title).toBeUndefined();
    expect(StaticMetadata.description).toBeUndefined();
  });

  it('takes its description from the en messages', () => {
    // expect the same description everywhere (en messages & package.json) ✅
    expect(APP_DESCRIPTION).toBe(enMessages.Metadata.description);
    expect(APP_DESCRIPTION).toBe(pkg.description);
    expect(enMessages.Metadata.titleTemplate).toBe('%s | abElements');
  });

  it('defaults to the production URL', () => {
    // expect `NEXT_PUBLIC_APP_URL` or the production URL ✅
    expect(APP_URL).toBe(process.env.NEXT_PUBLIC_APP_URL || 'https://ab-elements.vercel.app');
  });
});
