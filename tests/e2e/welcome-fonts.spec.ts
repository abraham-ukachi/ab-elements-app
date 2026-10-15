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
* @name: abElements Welcome Cyrillic Font E2E Tests
* @file: tests/e2e/welcome-fonts.spec.ts
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


// 🔤 Welcome Cyrillic e2e: the Russian titles render in Mulish (no fallback font, no tofu),
// checked with the computed style, `document.fonts` and Chromium's real per-glyph font usage (CDP).

// import the test helpers from `@playwright/test` 🎭
import { expect, test } from '@playwright/test';
// import the shared Welcome helpers 🧰
import { LAPTOP, MOBILE, SLIDE_IDS, openWelcome, slideTitle } from './welcome-helpers';


// laptop frame, light OS, reduced motion 💻☀️
test.use({ viewport: LAPTOP, colorScheme: 'light', reducedMotion: 'reduce' });


test.describe('Welcome ru titles in Mulish (Cyrillic) 🇷🇺', () => {
  test('every ru title is set in Mulish and only Mulish paints its glyphs', async ({ page }, testInfo) => {
    // open the Russian Welcome on s01
    await openWelcome(page, 'ru');

    // 1. the computed font-family starts with Mulish 🧮
    const family = await slideTitle(page, 's01').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.split(',')[0].trim().replace(/["']/g, '')).toBe('Mulish');

    // 2. `document.fonts`: a loaded Mulish face covers the Cyrillic title text 📚
    const fontsCheck = await slideTitle(page, 's01').evaluate(async (el) => {
      // wait for the fonts
      await document.fonts.ready;
      // the title's weight & text
      const { fontWeight } = getComputedStyle(el);
      // can Mulish render the Cyrillic text without falling back ? (`check` is true only if every glyph is covered by a loaded face)
      const covered = document.fonts.check(`${fontWeight} 48px Mulish`, el.textContent ?? '');
      // the loaded Mulish faces
      const loaded = [...document.fonts].filter((face) => face.family.replace(/["']/g, '') === 'Mulish' && face.status === 'loaded').length;
      return { covered, loaded };
    });
    expect(fontsCheck.covered).toBe(true);
    expect(fontsCheck.loaded).toBeGreaterThan(0);

    // 3. CDP: the fonts Chromium actually used for each title's glyphs (catches silent fallbacks) 🔬
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    // the used fonts per slide title
    const used: Record<string, string[]> = {};
    for (const id of SLIDE_IDS) {
      // the title node
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#welcome-${id}-title` });
      // walk its text nodes (inside `<em>` too) via the platform fonts of the element & children
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      const { nodeId: emId } = await cdp.send('DOM.querySelector', { nodeId, selector: 'em' });
      const emFonts = emId ? (await cdp.send('CSS.getPlatformFontsForNode', { nodeId: emId })).fonts : [];
      used[id] = [...new Set([...fonts, ...emFonts].map((font) => `${font.familyName}${font.isCustomFont ? '' : ' (system)'}`))];
    }
    // attach the evidence to the report 📎
    await testInfo.attach('ru-title-fonts.json', { body: JSON.stringify({ family, fontsCheck, used }, null, 2), contentType: 'application/json' });
    // expect only the self-hosted Mulish file on every title (its internal name is "Mulish" or a "Mulish <instance>" of
    // the variable font), never a system fallback ✅
    for (const id of SLIDE_IDS) {
      expect(used[id].length, id).toBeGreaterThan(0);
      for (const name of used[id]) expect(name, id).toMatch(/^Mulish( [A-Za-z]+)?$/);
    }
  });

  test('ru s01 laptop light screenshot (review) 📸', async ({ page }, testInfo) => {
    // open the Russian Welcome on s01
    await openWelcome(page, 'ru');
    // capture it for the review (not a baseline) 🖼️
    await page.screenshot({ path: testInfo.outputPath('ru-s01-laptop-light.png'), animations: 'disabled' });
  });

  test('ru titles wrap without clipping on mobile (s03, s06, s09) 📱', async ({ page }) => {
    // the mobile frame
    await page.setViewportSize(MOBILE);
    for (const n of [3, 6, 9]) {
      // open the slide
      await openWelcome(page, 'ru', n);
      // the title's box never scrolls sideways (no clipping) ✂️
      const overflow = await slideTitle(page, SLIDE_IDS[n - 1]).evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(overflow, `s0${n}`).toBeLessThanOrEqual(0);
    }
  });
});
