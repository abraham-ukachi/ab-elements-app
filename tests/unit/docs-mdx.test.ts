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
* @name: docs-mdx.test
* @file: tests/unit/docs-mdx.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/docs-mdx.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The docs MDX map (0.2.24): every MDX name points at a package piece (no app-local UI) & the callout aliases.

// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the map & the alias helper 🗺️
import { getDocsMdxComponents, toCalloutVariant } from '@/components/app/docs-mdx';
// import the package pieces it must hand out 🧩
import { AbContentTabs, AbContentTab } from 'ab-nextjs-components/ab-content-tabs';


describe('docs MDX map 🗺️', () => {
  it('🧩 wires links, code, callouts & tabs', () => {
    const map = getDocsMdxComponents({ copyLabel: 'Copy code', copiedLabel: 'Copied' });
    // 🔑 every MDX name we use
    for (const key of ['a', 'pre', 'Callout', 'Tabs', 'Tab']) expect(map[key as keyof typeof map], key).toBeTypeOf('function');
    // 🗂️ the tabs are the package's own components
    expect(map.Tabs).toBe(AbContentTabs);
    expect(map.Tab).toBe(AbContentTab);
  });

  it('🧩 per-page overrides win', () => {
    const custom = () => null;
    expect(getDocsMdxComponents({ copyLabel: 'a', copiedLabel: 'b' }, { a: custom }).a).toBe(custom);
  });

  it('💡 maps fumadocs callout names onto AbCallout variants', () => {
    expect(toCalloutVariant(undefined)).toBe('note');
    expect(toCalloutVariant('info')).toBe('note');
    expect(toCalloutVariant('tip')).toBe('tip');
    expect(toCalloutVariant('warn')).toBe('warning');
    expect(toCalloutVariant('warning')).toBe('warning');
    expect(toCalloutVariant('error')).toBe('danger');
    expect(toCalloutVariant('danger')).toBe('danger');
  });
});
