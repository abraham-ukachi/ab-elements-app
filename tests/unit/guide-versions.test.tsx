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
* @name: abElements Guide version tests
* @file: tests/unit/guide-versions.test.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/guide-versions.test.tsx
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Guide callouts name the installed package version (PackageVersion), not a number typed into the MDX.

// import the file reader 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the element helper 🧩
import { createElement, type ComponentType } from 'react';
// import the static renderer (the callout's text is what the build prints) 🖨️
import { renderToStaticMarkup } from 'react-dom/server';
// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the MDX map (PackageVersion lives there) 🗺️
import { getDocsMdxComponents } from '@/components/app/docs-mdx';
// import the same reader the component uses 🔢
import { installedAbVersion } from '@/lib/packages';


// 📖 one guide's source
const guide = (file: string): string => readFileSync(join(process.cwd(), 'content/docs/en/guides', file), 'utf8');

// 🔢 the version field of the installed package, read here the same way the component does
const installed = (name: string): string => JSON.parse(readFileSync(join(process.cwd(), 'node_modules', name, 'package.json'), 'utf8')).version as string;

// 🖨️ what `<PackageVersion name="…" />` prints
const printed = (name: string): string => {
  // 🗺️ the map the docs page hands to MDX
  const map = getDocsMdxComponents({ copyLabel: 'Copy', copiedLabel: 'Copied' });
  // 🔢 the component
  const Version = map.PackageVersion as ComponentType<{ name: string }>;
  // 🖨️ its text
  return renderToStaticMarkup(createElement(Version, { name }));
};


describe('guide callouts name the installed version 🔢', () => {
  it('the theming callout reads ab-nextjs-theme', () => {
    // 📄 the guide
    const source = guide('theming-dark-mode.mdx');
    // 🔢 the component, not a typed version
    expect(source).toContain('<PackageVersion name="ab-nextjs-theme" />');
    expect(source).not.toMatch(/Theme \d+\.\d+\.\d+/);
    // 🖨️ the same string as the installed package.json
    expect(printed('ab-nextjs-theme')).toBe(installed('ab-nextjs-theme'));
    expect(installedAbVersion('ab-nextjs-theme')).toBe(installed('ab-nextjs-theme'));
  });

  it('the fonts callout reads ab-nextjs-fonts', () => {
    // 📄 the guide
    const source = guide('icons-fonts.mdx');
    // 🔢 the fonts sentence
    expect(source).toContain('<PackageVersion name="ab-nextjs-fonts" />');
    expect(source).not.toMatch(/Fonts \d+\.\d+\.\d+/);
    // 🖨️ the installed version
    expect(printed('ab-nextjs-fonts')).toBe(installed('ab-nextjs-fonts'));
  });

  it('both icons callouts read ab-nextjs-icons', () => {
    // 📄 the guide
    const source = guide('icons-fonts.mdx');
    // 🔢 the module sentence and the mask-stylesheet sentence
    expect(source.match(/<PackageVersion name="ab-nextjs-icons" \/>/g)).toHaveLength(2);
    expect(source).not.toMatch(/[Ii]cons \d+\.\d+\.\d+/);
    // 🖨️ the installed version
    expect(printed('ab-nextjs-icons')).toBe(installed('ab-nextjs-icons'));
  });
});
