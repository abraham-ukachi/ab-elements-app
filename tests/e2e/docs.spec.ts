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
* @name: docs.spec
* @file: tests/e2e/docs.spec.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test:e2e tests/e2e/docs.spec.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The MDX docs pages (0.2.24), in all 4 locales: status, one h1 (= the frontmatter title), the English fallback
// banner, the "On this page" links (one per h2 / h3, each pointing at a real heading) & the scroll spy, prev / next,
// a real 404 for a missing slug, the edit link, the sitemap & the search index, + axe on a fallback page ♿.
// ✅ The former package gaps (AbCodeBlock copy button, AbCallout, AbContentTabs, theme `color-scheme`, the crumb
// link) are real tests since components 0.4.0 / theme 0.3.8.
// (The layout rules / touch / a11y suites also run on `/docs/installation`: it is in `PAGES` of layout-helpers.)

// import the test helpers from Playwright 🎭
import { expect, test } from '@playwright/test';
// import axe for Playwright ♿
import AxeBuilder from '@axe-core/playwright';
// import the shared page opener (skips the Splash, waits for the theme & fonts) 🧰
import { openPage } from './layout-helpers';


// 🌍 the 4 locales & their URL prefix (as-needed: none for English)
const LOCALES = [
  { locale: 'en', prefix: '' },
  { locale: 'fr', prefix: '/fr' },
  { locale: 'es', prefix: '/es' },
  { locale: 'ru', prefix: '/ru' },
] as const;

// 📚 the pages under test: slug, English title & whether fr / es / ru translate it
const DOCS = [
  { slug: '', title: 'Introduction', translated: true },
  { slug: '/installation', title: 'Installation', translated: true },
  { slug: '/quick-start', title: 'Quick start', translated: false },
  { slug: '/packages/core', title: 'Core', translated: false },
  { slug: '/guides/icons-fonts', title: 'Icons & fonts', translated: false },
] as const;

// 🏳️ the localized titles of the translated pages
const TRANSLATED_TITLES: Record<string, Record<string, string>> = {
  fr: { '': 'Introduction', '/installation': 'Installation' },
  es: { '': 'Introducción', '/installation': 'Instalación' },
  ru: { '': 'Введение', '/installation': 'Установка' },
};

// 🎯 the desktop outline links (the aside's AbToc; the drawer has its own copy)
const TOC_LINKS = '[data-ab-part="aside"] [data-ab-part="toc"] a[href^="#"]';
// 🎯 the MDX body's outline headings
const BODY_HEADINGS = '[data-docs-body] :is(h2, h3, h4)[id]';


for (const { locale, prefix } of LOCALES) {
  test.describe(`docs · ${locale} 📚`, () => {
    for (const doc of DOCS) {
      // 🔗 the URL & the expected title (the English one when the page falls back)
      const url = `${prefix}/docs${doc.slug}`;
      const fallback = locale !== 'en' && !doc.translated;
      const title = locale !== 'en' && doc.translated ? TRANSLATED_TITLES[locale][doc.slug] : doc.title;

      test(`✅ ${url}: 200, lang, one h1 = "${title}"${fallback ? ', fallback banner' : ''}`, async ({ page }) => {
        // 🧭 a real 200 (prerendered)
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        // 🌍 the document is in the requested locale, the article in its content's
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('article[data-docs-page]')).toHaveAttribute('lang', fallback ? 'en' : locale);
        // 1️⃣ one h1, the frontmatter title
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
        // 🏳️ the banner only on an English fallback
        await expect(page.locator('article [role="status"]')).toHaveCount(fallback ? 1 : 0);
        // 🔎 the document title carries the page title
        await expect(page).toHaveTitle(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} · `));
      });
    }

    test('🚫 a missing slug is a real 404 (the shell 404 page)', async ({ page }) => {
      for (const missing of ['/docs/nope', '/docs/packages/nope', '/docs/installation/extra']) {
        const response = await page.goto(`${prefix}${missing}`);
        expect(response?.status(), missing).toBe(404);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      }
    });

    test('⬅️➡️ prev / next follow meta.json (and stay in the locale)', async ({ page }) => {
      await openPage(page, `${prefix}/docs/installation`);
      const pager = page.locator('[data-docs-pager]');
      // ⬅️ Introduction, ➡️ Quick start
      await expect(pager.locator('a')).toHaveCount(2);
      await expect(pager.locator('a').first()).toHaveAttribute('href', `${prefix}/docs`);
      await expect(pager.locator('a').last()).toHaveAttribute('href', `${prefix}/docs/quick-start`);
      // 🖱️ next navigates
      await pager.locator('a').last().click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/docs/quick-start$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quick start');
      // 🏁 the first page has no "previous"
      await openPage(page, `${prefix}/docs`);
      await expect(page.locator('[data-docs-pager] a')).toHaveCount(1);
    });
  });
}


test.describe('docs · outline 📑', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('🔗 one TOC link per h2 / h3, each pointing at a real heading', async ({ page }) => {
    for (const url of ['/docs/installation', '/fr/docs/installation', '/ru/docs/quick-start']) {
      await openPage(page, url);
      // 📑 the body's headings & the outline's links
      const ids = await page.locator(BODY_HEADINGS).evaluateAll((nodes) => nodes.map((node) => node.id));
      const hrefs = await page.locator(TOC_LINKS).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
      expect(ids.length, url).toBeGreaterThan(1);
      expect(hrefs, url).toEqual(ids.map((id) => `#${id}`));
    }
  });

  test('🔭 scroll spy: the outline follows the reading position', async ({ page }) => {
    await openPage(page, '/docs/quick-start');
    const links = page.locator(TOC_LINKS);
    // 1️⃣ the first section is current before any scroll
    await expect(links.first()).toHaveAttribute('aria-current', 'location');
    // 🖱️ choosing the last section scrolls there & makes it current
    await links.last().click();
    await expect(links.last()).toHaveAttribute('aria-current', 'location');
    await expect(links.first()).not.toHaveAttribute('aria-current', 'location');
    // 🔗 the hash follows
    await expect(page).toHaveURL(/#keep-it-accessible$/);
  });

  test('✏️ "Edit this page" opens the content file on GitHub', async ({ page }) => {
    await openPage(page, '/fr/docs/quick-start');
    // 🏳️ a fallback page edits the English file
    await expect(page.locator('[data-ab-part="aside"] a[href*="/edit/main/"]')).toHaveAttribute('href', /\/content\/docs\/en\/quick-start\.mdx$/);
    await openPage(page, '/fr/docs/installation');
    await expect(page.locator('[data-ab-part="aside"] a[href*="/edit/main/"]')).toHaveAttribute('href', /\/content\/docs\/fr\/installation\.mdx$/);
  });

  test('🗂️ the sidebar links the docs pages (Installation is current)', async ({ page }) => {
    await openPage(page, '/docs/installation');
    await expect(page.locator('[data-ab-part="sidebar"] a[href="/docs/installation"]')).toHaveCount(1);
    await expect(page.locator('[data-ab-part="sidebar"] a[href="/docs/packages/core"]')).toHaveCount(1);
  });
});


test.describe('docs · code 🖍️', () => {
  test('🖍️ Shiki highlights at build time (no highlighter shipped)', async ({ page }) => {
    await openPage(page, '/docs/installation');
    const pre = page.locator('[data-docs-body] pre').first();
    // 🎨 token spans with light-dark() colours
    expect(await pre.locator('span[style*="light-dark("]').count()).toBeGreaterThan(1);
    // 🚫 no stray fumadocs-ui attributes on <pre>
    await expect(pre).not.toHaveAttribute('icon', /.*/);
  });

  // 📋 AbCodeBlock (components 0.4.0): every fenced block has a copy button that copies its code
  test('📋 each code block has a copy button (AbCodeBlock)', async ({ page, context, browserName }) => {
    await openPage(page, '/docs/installation');
    const blocks = page.locator('[data-docs-body] [data-ab-part="code-block"]');
    // 🧱 one AbCodeBlock per <pre> (the hidden tab panels included)
    expect(await blocks.count()).toBe(await page.locator('[data-docs-body] pre').count());
    const first = blocks.first();
    await expect(first.getByRole('button', { name: /copy code/i })).toHaveCount(1);
    // 📄 the `title="…"` fence meta is the filename header
    await expect(page.locator('[data-docs-body] [data-ab-part="code-block-head"]', { hasText: 'next.config.ts' })).toHaveCount(1);
    // 📋 the clipboard gets the code (Chromium only: the permission API)
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await first.getByRole('button', { name: /copy code/i }).click();
      await expect(first.getByRole('status')).toHaveText('Copied');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('pnpm add ab-nextjs-core ab-nextjs-components ab-nextjs-theme');
    }
  });

  // 🌗 theme 0.3.8 sets `color-scheme` on `.dark` / `.light`, so light-dark() follows the picked theme
  test('🌗 the code follows the picked theme, not the OS', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await openPage(page, '/docs/installation');
    await page.evaluate(() => { document.documentElement.classList.remove('light'); document.documentElement.classList.add('dark'); });
    const scheme = await page.locator('[data-docs-body] pre').first().evaluate((node) => getComputedStyle(node).colorScheme);
    expect(scheme).toContain('dark');
  });

  // 🍞 AbBreadcrumbs (components 0.4.0) crumbs are ≥ 24×24, so the tablet "Docs" crumb is a link again
  test('🍞 the tablet "Docs" crumb links the docs index', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await openPage(page, '/docs/installation');
    const crumb = page.locator('[data-ab-part="main-header"] a[href="/docs"]');
    await expect(crumb).toHaveCount(1);
    const box = await crumb.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  });

  // 💬 AbCallout (components 0.4.0) for MDX `<Callout type="note|tip|warning|danger">`
  test('💬 callouts render as AbCallout', async ({ page }) => {
    await openPage(page, '/docs/installation');
    const callouts = page.locator('[data-docs-body] [data-ab-part="callout"]');
    await expect(callouts).toHaveCount(2);
    await expect(callouts.first()).toHaveAttribute('role', 'note');
    await expect(callouts.first()).toHaveAttribute('data-variant', 'tip');
    await expect(callouts.last()).toHaveAttribute('data-variant', 'warning');
  });

  // 🗂️ AbContentTabs (components 0.4.0) for MDX `<Tabs>` / `<Tab>`: ARIA tabs, arrow keys switch the panel
  test('🗂️ content tabs switch panels (AbContentTabs)', async ({ page }) => {
    await openPage(page, '/docs/installation');
    const tabs = page.locator('[data-docs-body] [data-ab-part="content-tabs"]').first();
    await expect(tabs.getByRole('tab')).toHaveCount(2);
    await expect(tabs.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.getByRole('tabpanel')).toContainText('pnpm add');
    // ⌨️ → moves to npm
    await tabs.getByRole('tab', { name: 'pnpm' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.getByRole('tabpanel')).toContainText('npm install');
  });

  // 📄 the theme's `.ab-prose` typography wraps the MDX body
  test('📄 the body uses the theme prose typography', async ({ page }) => {
    await openPage(page, '/docs/installation');
    await expect(page.locator('[data-docs-body]')).toHaveClass(/\bab-prose\b/);
  });
});


test.describe('docs · sitemap & search 🗺️🔎', () => {
  test('🗺️ the sitemap lists every docs page in every locale', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const path of ['/docs', '/docs/installation', '/docs/packages/core', '/docs/guides/icons-fonts']) {
      expect(xml, path).toContain(`${path}</loc>`);
      for (const prefix of ['/fr', '/es', '/ru']) expect(xml, `${prefix}${path}`).toContain(`${prefix}${path}"`);
    }
  });

  test('🔎 /api/search serves the static per-locale index', async ({ request }) => {
    const response = await request.get('/api/search');
    expect(response.status()).toBe(200);
    const data = await response.json();
    // 🌍 one index per locale
    const text = JSON.stringify(data);
    for (const locale of ['en', 'fr', 'es', 'ru']) expect(text).toContain(`"${locale}"`);
    expect(text).toContain('Installation');
  });
});


test.describe('docs · a11y ♿', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`🪓 axe on a fallback page (fr, ${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width: 1280, height: 800 });
      await openPage(page, '/fr/docs/quick-start');
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`)).toEqual([]);
    });
  }
});
