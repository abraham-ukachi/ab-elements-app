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
* @name: docs page template tests
* @file: tests/unit/docs-template.test.ts
* @type: test (Vitest)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/docs-template.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The docs page template (0.2.25): the header chips (docsChips), the Edit / Report / Source URLs, their messages in
// all 4 locales, and Lighthouse CI in warn mode (lighthouserc.cjs + the workflow). The rendered page (TOC, scroll spy,
// drawer, links, chips × 4 locales × light / dark) is covered by tests/e2e/docs-template.spec.ts 🎭.

// import the file helpers from Node 📁
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the helpers under test 📚
import { docsChips, docsEditUrl, docsReportUrl, docsSourceUrl } from '@/lib/docs';
import { GITHUB_URL } from '@/lib/nav';


// 🌍 the 4 locales
const LOCALES = ['en', 'fr', 'es', 'ru'] as const;
// 📖 one locale's messages
const messagesOf = (locale: string) => JSON.parse(readFileSync(join(process.cwd(), `messages/${locale}.json`), 'utf8'));
// 🔎 a dotted key in an object (undefined when missing)
const at = (obj: unknown, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);


describe('docsChips 🏷️', () => {
  it('a getting-started page has only its section chip', () => {
    expect(docsChips(['installation'], {})).toEqual([{ id: 'section', key: 'chips.section.gettingStarted', tone: 'neutral' }]);
    expect(docsChips([], {})[0].key).toBe('chips.section.gettingStarted'); // 🏠 /docs
  });

  it('guides & packages get their own section', () => {
    expect(docsChips(['guides', 'icons-fonts'], {})[0].key).toBe('chips.section.guides');
    expect(docsChips(['packages', 'core'], {})[0].key).toBe('chips.section.packages');
  });

  it('a package page: section · package (mono, untranslated) · kind · status, in that order', () => {
    const chips = docsChips(['packages', 'core'], { package: 'ab-nextjs-core', kind: 'server', status: 'beta' });
    expect(chips.map((c) => c.id)).toEqual(['section', 'package', 'kind', 'status']);
    expect(chips[1]).toMatchObject({ text: 'ab-nextjs-core', mono: true, tone: 'accent' });
    expect(chips[1].key).toBeUndefined();
    expect(chips[2].key).toBe('chips.kind.server');
    expect(chips[3]).toMatchObject({ key: 'chips.status.beta', dot: 'bronze', tone: 'neutral' });
  });

  it('stable is the sage chip', () => {
    expect(docsChips(['packages', 'x'], { status: 'stable' })[1]).toMatchObject({ dot: 'sage', tone: 'sage' });
  });
});


describe('Edit / Report / Source URLs 🔗', () => {
  it('Edit opens the GitHub editor, Source the read-only blob, of the same file', () => {
    expect(docsEditUrl('fr', 'installation.mdx')).toBe(`${GITHUB_URL}/edit/main/content/docs/fr/installation.mdx`);
    expect(docsSourceUrl('fr', 'installation.mdx')).toBe(`${GITHUB_URL}/blob/main/content/docs/fr/installation.mdx`);
    expect(docsSourceUrl('en', '/packages/core/index.mdx')).toBe(`${GITHUB_URL}/blob/main/content/docs/en/packages/core/index.mdx`);
  });

  it('Report prefills a GitHub issue (title, page URL, file, docs label), safely encoded', () => {
    const url = new URL(docsReportUrl({ title: 'Icons & fonts', url: 'https://ab-elements.vercel.app/fr/docs/guides/icons-fonts', file: 'content/docs/en/guides/icons-fonts.mdx' }));
    expect(`${url.origin}${url.pathname}`).toBe(`${GITHUB_URL}/issues/new`);
    expect(url.searchParams.get('title')).toBe('Docs: Icons & fonts');
    expect(url.searchParams.get('labels')).toBe('docs');
    expect(url.searchParams.get('body')).toContain('Page: https://ab-elements.vercel.app/fr/docs/guides/icons-fonts');
    expect(url.searchParams.get('body')).toContain('File: content/docs/en/guides/icons-fonts.mdx');
    // 🔒 the `&` stays inside the title (one title param, no stray keys)
    expect([...url.searchParams.keys()].sort()).toEqual(['body', 'labels', 'title']);
  });
});


describe('template messages in all 4 locales 🌍', () => {
  const KEYS = [
    'Shell.aside.editPage', 'Shell.aside.reportIssue', 'Shell.aside.viewSource', 'Shell.aside.onThisPage',
    'Docs.chips.label', 'Docs.chips.section.gettingStarted', 'Docs.chips.section.guides', 'Docs.chips.section.packages',
    'Docs.chips.kind.client', 'Docs.chips.kind.server',
    'Docs.chips.status.new', 'Docs.chips.status.beta', 'Docs.chips.status.stable', 'Docs.chips.status.deprecated',
  ];
  for (const locale of LOCALES) {
    it(`${locale}: every template key is a non-empty string`, () => {
      const messages = messagesOf(locale);
      for (const key of KEYS) expect(typeof at(messages, key) === 'string' && (at(messages, key) as string).length > 0, `${locale} ${key}`).toBe(true);
    });
  }
  it('fr / es / ru translate the link labels (not the English text)', () => {
    const en = messagesOf('en');
    for (const locale of ['fr', 'es', 'ru']) {
      for (const key of ['Shell.aside.reportIssue', 'Shell.aside.viewSource', 'Docs.chips.section.gettingStarted']) expect(at(messagesOf(locale), key), `${locale} ${key}`).not.toBe(at(en, key));
    }
  });
});


describe('Lighthouse CI in warn mode 🚦', () => {
  // 📦 load the CommonJS config with a given preset
  const load = (preset?: string) => {
    const require = createRequire(import.meta.url);
    const path = join(process.cwd(), 'lighthouserc.cjs');
    const before = process.env.AB_LH_PRESET;
    if (preset) process.env.AB_LH_PRESET = preset; else delete process.env.AB_LH_PRESET;
    delete require.cache[require.resolve(path)];
    const config = require(path);
    if (before === undefined) delete process.env.AB_LH_PRESET; else process.env.AB_LH_PRESET = before;
    return config.ci;
  };

  it('every assertion is `warn` (never `error`), with the plan targets', () => {
    const { assert } = load();
    const entries = Object.entries(assert.assertions) as [string, [string, { minScore: number }]][];
    expect(entries.length).toBeGreaterThanOrEqual(4);
    for (const [name, [level]] of entries) expect(level, name).toBe('warn');
    expect(assert.assertions['categories:accessibility'][1].minScore).toBe(1);
    expect(assert.assertions['categories:performance'][1].minScore).toBe(0.9);
  });

  it('audits Home, an English & a French docs page as a returning visitor, 3 runs each', () => {
    const { collect } = load();
    expect(collect.url.map((u: string) => new URL(u).pathname)).toEqual(['/', '/docs/installation', '/fr/docs/quick-start']);
    expect(collect.numberOfRuns).toBe(3);
    expect(JSON.parse(collect.settings.extraHeaders).Cookie).toContain('AB_APP_HELLO=true');
  });

  it('mobile by default, the desktop preset with AB_LH_PRESET=desktop; reports stay local', () => {
    expect(load().collect.settings.preset).toBeUndefined();
    expect(load('desktop').collect.settings.preset).toBe('desktop');
    expect(load().upload.target).toBe('filesystem');
  });

  it('the workflow runs both presets on pull requests without failing them', () => {
    const file = join(process.cwd(), '.github/workflows/lighthouse.yml');
    expect(existsSync(file)).toBe(true);
    const yml = readFileSync(file, 'utf8');
    expect(yml).toMatch(/pull_request:/);
    expect(yml).toMatch(/preset: \[mobile, desktop\]/);
    expect(yml).toMatch(/@lhci\/cli@\d+\.\d+\.\d+ autorun/); // 📌 an exact version
    expect(yml).not.toMatch(/continue-on-error/); // ⚠️ warn mode comes from the assertions, not from hiding failures
  });
});
