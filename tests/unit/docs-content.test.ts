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
* @name: docs-content.test
* @file: tests/unit/docs-content.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/docs-content.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The 0.2.27 getting-started and package overview pages: the eleven English files, the install
// snippet the e2e copies, and the quick-start heading the scroll spy clicks.

// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the path joiner 🧭
import { join } from 'node:path';
// import the sidebar package order and the docs tree (the pager must follow the sidebar) 📦
import { AB_PACKAGE_IDS } from '@/lib/packages';
import { docsUnprefixed, flattenDocsTree, type DocsTreeNode } from '@/lib/docs';
import { source } from '@/lib/source';


// 📚 the eleven pages in scope (English source)
const PAGES = [
  'index.mdx',
  'installation.mdx',
  'quick-start.mdx',
  'packages/fonts/index.mdx',
  'packages/icons/index.mdx',
  'packages/animations/index.mdx',
  'packages/theme/index.mdx',
  'packages/hooks/index.mdx',
  'packages/core/index.mdx',
  'packages/components/index.mdx',
  'packages/i18n/index.mdx',
] as const;

// 📖 one page's markdown
const read = (file: string) => readFileSync(join(process.cwd(), 'content/docs/en', file), 'utf8');


describe('docs content 0.2.27 📚', () => {
  it('📄 the eleven English pages exist and name their title', () => {
    for (const file of PAGES) {
      const text = read(file);
      expect(text.startsWith('---\n'), file).toBe(true);
      expect(text, file).toMatch(/^title: /m);
    }
  });

  it('📦 the animations page is titled Animations', () => {
    const text = read('packages/animations/index.mdx');
    expect(text).toMatch(/^title: Animations$/m);
    // 🚫 the package is not introduced under another product name
    expect(text).not.toMatch(/^#+\s+Motion\b/m);
  });

  it('📋 installation keeps the pnpm command, one next.config.ts fence and the two callouts', () => {
    const text = read('installation.mdx');
    expect(text).toContain('pnpm add ab-nextjs-core ab-nextjs-components ab-nextjs-theme');
    expect(text).toContain('npm install ab-nextjs-core ab-nextjs-components ab-nextjs-theme');
    expect(text.match(/title="next\.config\.ts"/g)).toHaveLength(1);
    expect(text).toContain('type="tip"');
    expect(text).toContain('type="warning"');
  });

  it('📝 the introduction does not read like a design spec', () => {
    const text = read('index.mdx');
    expect(text).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
    expect(text).not.toMatch(/\b(Mulish|Inter|Roboto Mono)\b/);
  });

  it('⬅️➡️ the package pager follows the sidebar order', () => {
    const meta = JSON.parse(readFileSync(join(process.cwd(), 'content/docs/en/packages/meta.json'), 'utf8')) as { pages: string[] };
    expect(meta.pages).toEqual([...AB_PACKAGE_IDS]);
    const packages = AB_PACKAGE_IDS.map((id) => `/docs/packages/${id}`);
    for (const locale of ['en', 'fr'] as const) {
      const urls = flattenDocsTree(source.getPageTree(locale).children as DocsTreeNode[]).map((page) => docsUnprefixed(page.url, ['en', 'fr', 'es', 'ru']));
      const at = urls.indexOf('/docs/quick-start');
      expect(urls.slice(at, at + 1 + packages.length), locale).toEqual(['/docs/quick-start', ...packages]);
    }
  });

  it('🔭 quick start still ends on "Keep it accessible"', () => {
    const text = read('quick-start.mdx');
    const headings = [...text.matchAll(/^#{2,4} .+$/gm)].map((match) => match[0]);
    expect(headings.at(-1)).toBe('### Keep it accessible');
  });
});
