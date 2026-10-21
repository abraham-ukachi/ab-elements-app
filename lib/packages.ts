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
* @name: abElements Packages Data
* @file: lib/packages.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> const packages = getAbPackages() // 8 cards, real versions 📦
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📦 The package data of Home's cards & the sidebar badges (0.2.23 scaffolding): read at build time from each
// INSTALLED package's own `package.json` (`name`, `version`, `description`), so the version chips are always real (D22).
// Server/build only (it reads node_modules): a missing package fails the build, there's no runtime fetch (§1.4).

// import the file helpers from Node 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';


// 🆔 the eight AbElements packages, in card order (D21: i18n included)
// 🎯 fidelity spec: the mock's card order (fonts → components), then i18n (Decision 1: all 8 real packages)
export const AB_PACKAGE_IDS = ['fonts', 'icons', 'animations', 'theme', 'hooks', 'core', 'components', 'i18n'] as const;

// 🆔 a package id (`'core' | 'components' | ...`)
export type AbPackageId = (typeof AB_PACKAGE_IDS)[number];

// 📦 one package card
export type AbPackage = Readonly<{
  id: AbPackageId; // 🆔
  name: string; // 📛 `ab-nextjs-<id>` (code, never translated)
  title: string; // 🏷️ the display name (`Fonts`, `i18n`…): a product name like "AbElements", never translated
  version: string; // 🔢 the installed version (`0.3.3`)
  versionLabel: string; // 🏷️ the chip (`v0.3.x`)
  description: string | null; // 📝 npm's description (null → `Home.packages.<id>.desc` copy)
  href: string; // 🔗 the package docs page
  beta: boolean; // 🧪 only when God marks it
}>;

// 🧪 the packages God marked as beta (fidelity spec, approved 20:10: Animations gets the `beta` chip)
const BETA: readonly AbPackageId[] = ['animations'];


/**
 * `toVersionLabel` - `0.3.3` → `v0.3.x` 🏷️
 *
 * @param { string } version - a semver version
 * @returns { string }
 */
export function toVersionLabel(version: string): string {
  // ✂️ major.minor
  const match = /^(\d+)\.(\d+)\./.exec(version);
  // 🚨 not semver ? the build should fail loudly
  if (!match) throw new Error(`lib/packages: "${version}" is not a semver version`);
  // 🏷️ the chip
  return `v${match[1]}.${match[2]}.x`;
}


/**
 * `getAbPackages` - the 8 package cards 📦
 *
 * @param { string } root - the app root (where `node_modules` lives; defaults to the cwd)
 * @returns { AbPackage[] }
 */
export function getAbPackages(root: string = process.cwd()): AbPackage[] {
  return AB_PACKAGE_IDS.map((id) => {
    // 📛 the npm name
    const name = `ab-nextjs-${id}`;
    // 📖 its installed package.json (throws → the build fails 🚨)
    const pkg = JSON.parse(readFileSync(join(root, 'node_modules', name, 'package.json'), 'utf8')) as { name?: string; version?: string; description?: string };
    // 🔢 the installed version
    const version = String(pkg.version ?? '');
    // 📦 the card
    return {
      id,
      name,
      title: id === 'i18n' ? 'i18n' : id[0].toUpperCase() + id.slice(1), // 🏷️ fidelity spec: the sidebar's display names
      version,
      versionLabel: toVersionLabel(version),
      description: pkg.description?.trim() || null,
      href: `/#package-${id}`, // 🔗 the Home card anchor (no /docs, God 01:27)
      beta: BETA.includes(id),
    };
  });
}


/**
 * `getAbPackageSymbols` - the public `Ab*` components & `useAb*` hooks a package exports (the search drawer's index) 🔎
 * Read from the installed package's root `index.ts` (or `index.js`); a package without one simply has no symbols.
 *
 * @param { AbPackageId } id - the package id (e.g. `components`)
 * @param { string } root - the app root (defaults to the cwd)
 * @returns { string[] } - unique names, in export order (e.g. `['AbIcon', 'AbButton', ...]`)
 */
export function getAbPackageSymbols(id: AbPackageId, root: string = process.cwd()): string[] {
  for (const file of ['index.ts', 'index.tsx', 'index.js']) {
    try {
      const source = readFileSync(join(root, 'node_modules', `ab-nextjs-${id}`, file), 'utf8');
      // 🧩 every `export { ... }` / `export const|function` name that looks like a component or a hook
      const names = [...source.matchAll(/^export\s+(?:\{([^}]*)\}|(?:const|function)\s+(\w+))/gm)]
        .flatMap((m) => (m[1] ? m[1].split(',').map((part) => part.trim().split(/\s+as\s+/).pop() ?? '') : [m[2]]))
        .map((name) => name.replace(/^type\s+/, '').trim())
        .filter((name) => /^(Ab[A-Z]\w*|useAb\w+)$/.test(name) && !/(Props|Item|Option|Section|Group|Snap|Tier|Side|Scope)$/.test(name));
      return [...new Set(names)];
    } catch { /* 🤷 try the next entry file */ }
  }
  return [];
}
