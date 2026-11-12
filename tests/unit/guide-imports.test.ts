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
* @name: abElements Guide import tests
* @file: tests/unit/guide-imports.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/guide-imports.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Every fenced import in the three guides must be a real public export (scripts/export-surface.mts).

// import the file reader 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the 0.2.28 export-surface check 🛂
import { checkGuideSources } from '../../scripts/export-surface.mts';


// 📚 the guides this pass rewrote
const GUIDES = ['theming-dark-mode.mdx', 'icons-fonts.mdx', 'layout-rule.mdx'] as const;


describe('guide imports 🛂', () => {
  it('every fenced ab-nextjs import is on the published export surface', { timeout: 60_000 }, () => {
    // 📄 the three English sources
    const files = GUIDES.map((name) => {
      const file = join('content', 'docs', 'en', 'guides', name); // 📁
      return { file, source: readFileSync(join(process.cwd(), file), 'utf8') };
    });
    // ✅ none of them invent an import
    expect(checkGuideSources(process.cwd(), files)).toEqual([]);
  });
});
