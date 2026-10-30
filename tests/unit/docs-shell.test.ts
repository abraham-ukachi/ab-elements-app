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
* @name: abElements Docs Shell Tests
* @file: tests/unit/docs-shell.test.ts
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


// 🧪 The packaged docs shell: the packaged theme script (hooks 0.1.7) replaced the app's copy, and every
// icon the sidebar / bottom bar / cards ask for is registered for the client AbIcon (components 0.1.13) 🔣.

// import the file helpers from Node 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers from `vitest` 🧪
import { describe, expect, it } from 'vitest';

// import the data that names icons 🗂️
import { BOTTOM_TABS, SIDEBAR_HOME, SIDEBAR_SECTIONS } from '@/lib/nav';
import { PACKAGE_ICONS, SHELL_ICONS } from '@/lib/shell-icons';


// read a source file 📖
const read = (path: string): string => readFileSync(join(process.cwd(), path), 'utf8');


describe('docs shell 🧭', () => {
  it('uses the packaged theme script (no app-local copy) 🌗', () => {
    const layout = read('app/[locale]/layout.tsx');
    expect(layout).toContain("getAbThemeScript({ defaultTheme: 'system' })");
    expect(layout).not.toContain("localStorage.getItem('theme')");
  });

  it('registers every icon the shell & the cards use 🔣', () => {
    // the registered names (the data handed to AbIconRegistrar) 🗂️
    const registered = new Set(Object.keys(SHELL_ICONS));
    // the names the shell asks for (unbuilt sidebar items are hidden, D26)
    const wanted = [SIDEBAR_HOME.icon, ...BOTTOM_TABS.map((tab) => tab.icon), ...Object.values(PACKAGE_ICONS), 'toc'];
    for (const name of wanted) expect(registered.has(name ?? ''), name).toBe(true);
    // the ready sidebar items too
    for (const item of SIDEBAR_SECTIONS.flatMap((section) => section.items).filter((entry) => entry.ready)) expect(registered.has(item.icon ?? ''), item.id).toBe(true);
  });

  it('wraps the shell in AbLinkProvider with the locale-aware Link 🔗', () => {
    const shell = read('components/app/docs-shell/index.tsx');
    expect(shell).toContain('<AbLinkProvider component={Link} locales={abI18nConfig.locales}>');
    expect(shell).not.toContain('as unknown as');
    // 🧭 0.2.22: the registrar lives in the shared shell frame (the `(docs)` layout and the 404s both use it)
    expect(read('components/app/docs-shell/frame.tsx')).toContain('<AbIconRegistrar icons={SHELL_ICONS} />');
    expect(read('app/[locale]/(docs)/layout.tsx')).toContain('<DocsShellFrame locale={locale}>');
    expect(shell).toContain('variant="panes"');
    expect(shell).toContain('onCollapsedChange={setRail}');
  });
});
