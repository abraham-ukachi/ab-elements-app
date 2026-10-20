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
* @name: abElements Shell Data Tests
* @file: tests/unit/shell-data.test.ts
* @type: TypeScript
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


// 🧪 The docs shell data: nav (D26 ready flags), packages (real installed versions, D22), the rail key (0.2.22)
// and the `(docs)` route group (skip link + error boundary).

// import the file helpers from Node 📁
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the data under test
import { BOTTOM_TABS, SIDEBAR_SECTIONS, TOP_LINKS, readyNavSections } from '@/lib/nav';
import { AB_PACKAGE_IDS, getAbPackages, toVersionLabel } from '@/lib/packages';
import { AB_SIDEBAR_RAIL_KEY, parseSidebarRail } from '@/lib/sidebar-rail';


// the en Shell messages (to resolve the nav labels) 🇬🇧
const SHELL = JSON.parse(readFileSync(join(process.cwd(), 'messages/en.json'), 'utf8')).Shell;
// resolve a dotted key in the Shell messages 🔑
const resolve = (key: string): unknown => key.split('.').reduce<any>((node, part) => node?.[part], SHELL);


describe('lib/nav 🧭', () => {
  it('every label is a Shell message key 🔑', () => {
    const labels = [...TOP_LINKS, ...BOTTOM_TABS, ...SIDEBAR_SECTIONS, ...SIDEBAR_SECTIONS.flatMap((section) => section.items)].map((item) => item.label);
    for (const label of labels) expect(typeof resolve(label), label).toBe('string');
  });

  it('the bottom bar is Home · Docs · Search · Profile 📱', () => {
    expect(BOTTOM_TABS.map((tab) => tab.id)).toEqual(['home', 'docs', 'search', 'profile']);
  });

  it('hides unbuilt items but keeps the packages section (D26) 🧹', () => {
    const ready = readyNavSections(SIDEBAR_SECTIONS);
    // 🎯 fidelity spec: Getting started & Guides show again, anchored on Home's sections
    expect(ready.map((section) => section.id)).toEqual(['gettingStarted', 'packages', 'guides']);
    expect(ready.flatMap((section) => section.items).every((item) => item.ready)).toBe(true);
  });

  it('anchors the not-yet-built pages on Home (no 404s, D26) ⚓', () => {
    const hrefs = [...TOP_LINKS, ...SIDEBAR_SECTIONS.flatMap((section) => section.items)].filter((item) => item.ready).map((item) => item.href);
    for (const href of hrefs) expect(href === '/' || href.startsWith('/#'), href).toBe(true);
  });
});


describe('lib/packages 📦', () => {
  it('turns a version into a minor chip (D22) 🏷️', () => {
    expect(toVersionLabel('0.3.3')).toBe('v0.3.x');
    expect(toVersionLabel('1.12.0-beta.1')).toBe('v1.12.x');
    expect(() => toVersionLabel('latest')).toThrow();
  });

  it('reads the 8 installed packages with their real versions 8️⃣', () => {
    const packages = getAbPackages();
    expect(packages.map((pkg) => pkg.id)).toEqual([...AB_PACKAGE_IDS]);
    for (const pkg of packages) {
      const installed = JSON.parse(readFileSync(join(process.cwd(), 'node_modules', pkg.name, 'package.json'), 'utf8'));
      expect(pkg.version, pkg.name).toBe(installed.version);
      expect(pkg.versionLabel, pkg.name).toMatch(/^v\d+\.\d+\.x$/);
    }
  });
});


describe('lib/sidebar-rail 🗂️', () => {
  it('saves under ab-sidebar-rail and only JSON true collapses 🔑', () => {
    expect(AB_SIDEBAR_RAIL_KEY).toBe('ab-sidebar-rail');
    expect(parseSidebarRail('true')).toBe(true);
    for (const raw of [null, 'false', '"true"', 'garbage']) expect(parseSidebarRail(raw)).toBe(false);
  });
});


describe('app/[locale]/(docs) route group 🗂️', () => {
  // the route group folder
  const dir = join(process.cwd(), 'app/[locale]/(docs)');

  it('Home moved into (docs) (same URLs) 🚚', () => {
    expect(existsSync(join(dir, 'page.tsx'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'app/[locale]/page.tsx'))).toBe(false);
  });

  it('the skip link targets #main, which Home and the error boundary render ♿', () => {
    expect(readFileSync(join(dir, 'layout.tsx'), 'utf8')).toContain('href="#main"');
    expect(readFileSync(join(dir, 'page.tsx'), 'utf8')).toMatch(/<AbMainLayout\s+id="main"\s+orientation="vertical"/); // 🫥 no chrome shim (empty slots are 0px)
    expect(readFileSync(join(dir, 'error.tsx'), 'utf8')).toContain('id="main"');
  });
});
