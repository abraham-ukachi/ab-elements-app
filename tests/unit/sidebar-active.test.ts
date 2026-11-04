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
* @name: sidebar active item tests
* @file: tests/unit/sidebar-active.test.ts
* @type: test (Vitest)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/sidebar-active.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🎯 One active item (0.2.25, components 0.5.0): AbSidebar & AbNavDrawer light only the DEEPEST matching item
// (`activeMatch="best"`, the default), so the Introduction item (`/docs`) no longer lights up next to Installation on
// `/docs/installation`. These tests run the packaged matcher on the app's REAL sidebar data (lib/nav), with the
// locale-free pathname the shell passes as `activeHref` (the same in all 4 locales 🌍). The rendered sidebar & drawer
// are covered by tests/e2e/sidebar-active.spec.ts 🎭.

// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';
// import the packaged active matcher (the one AbSidebar & AbNavDrawer use) 🧩
import { createAbSidebarActive, type AbSidebarSection } from 'ab-nextjs-components/ab-sidebar/view';
// import the app's sidebar data 🗂️
import { SIDEBAR_HOME, SIDEBAR_SECTIONS, readyNavSections } from '@/lib/nav';


// 🗂️ the sidebar as the shell hands it to the package (Home + the ready sections; labels don't matter here)
const sections: AbSidebarSection[] = [
  { id: 'home', label: 'home', items: [{ href: SIDEBAR_HOME.href, id: SIDEBAR_HOME.id, label: SIDEBAR_HOME.id }] },
  ...readyNavSections(SIDEBAR_SECTIONS).map((s) => ({ id: s.id, label: s.id, items: s.items.map((i) => ({ id: i.id, href: i.href, label: i.id })) })),
] as AbSidebarSection[];
// 🔗 every item href
const hrefs = sections.flatMap((s) => s.items.map((i) => i.href));
// 🎯 the hrefs active on a route (the default match = 'best')
const activeOn = (route: string) => { const active = createAbSidebarActive(sections, route); return hrefs.filter((h) => active(h)); };


describe('one active sidebar item 🎯', () => {
  it('the data still has the overlapping pair (/docs is a parent of /docs/installation)', () => {
    expect(hrefs).toContain('/docs');
    expect(hrefs).toContain('/docs/installation');
  });

  for (const route of ['/docs', '/docs/installation', '/docs/quick-start']) {
    it(`${route}: exactly one item, its own`, () => {
      expect(activeOn(route)).toEqual([route]);
    });
  }

  it('query strings, hashes & trailing slashes don\'t change the pick', () => {
    expect(activeOn('/docs/installation/')).toEqual(['/docs/installation']);
    expect(activeOn('/docs/installation#install-the-packages')).toEqual(['/docs/installation']);
    expect(activeOn('/docs?x=1')).toEqual(['/docs']);
  });

});
