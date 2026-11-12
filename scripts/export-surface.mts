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
* @name: export-surface
* @file: scripts/export-surface.mts
* @type: build script (server only, never imported by a client component)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { exportMap, relevantExports } from './scripts/export-surface.mts';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📦 The published export map for the entries this docs pass is about.
//    A file on disk is not an import path. Only a key in `package.json` `"exports"` is.

// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the path helper 🧭
import { join } from 'node:path';
// import ts-morph, so a re-export counts as a real exported name 🔎
import { Node, Project } from 'ts-morph';

// 🎯 one consumer import this pass has to account for
export type PublicExport = {
  packageName: string;
  entry: string;
  name: string;
  kind: 'named' | 'default';
};

// 📚 the entrypoints of the drawer, the outline helper, the layout slots, and the scroll spy.
//    Not the rest of each package.
export const RELEVANT_EXPORTS: readonly { packageName: string; subpath: string }[] = [
  { packageName: 'ab-nextjs-components', subpath: './ab-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-drawer/use-ab-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-toc' },
  { packageName: 'ab-nextjs-components', subpath: './ab-nav-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-toc-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-bottom-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-search-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-settings-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-confirm-drawer' },
  { packageName: 'ab-nextjs-components', subpath: './ab-drawer-list' },
  { packageName: 'ab-nextjs-core', subpath: './ab-app-layout' },
  { packageName: 'ab-nextjs-core', subpath: './ab-main-layout' },
  { packageName: 'ab-nextjs-core', subpath: './ab-aside-layout' },
  { packageName: 'ab-nextjs-core', subpath: './server/ab-app-layout' },
  { packageName: 'ab-nextjs-core', subpath: './server/ab-main-layout' },
  { packageName: 'ab-nextjs-core', subpath: './server/ab-aside-layout' },
  { packageName: 'ab-nextjs-core', subpath: './ab-page-provider' },
  { packageName: 'ab-nextjs-hooks', subpath: './useAbScrollSpy' },
];

// 🧠 one project per process, so the inventory and the pages share the same read
let cache: { root: string; rows: PublicExport[] } | null = null;


/**
 * `exportTarget` - the file an exports value points at 🧭
 *
 * @param { unknown } value
 * @returns { string | null }
 */
function exportTarget(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'default' in value && typeof value.default === 'string') return value.default;
  return null;
}


/**
 * `exportMap` - `"exports"` keys to their default file, for one installed package 📦
 *
 * @param { string } root - the app root
 * @param { string } packageName
 * @returns { Map<string, string> }
 */
export function exportMap(root: string, packageName: string): Map<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, 'node_modules', packageName, 'package.json'), 'utf8')) as { exports?: Record<string, unknown> };
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
    const target = exportTarget(value);
    if (target && !target.includes('*')) map.set(key, target);
  }
  return map;
}


/**
 * `relevantExports` - every named export, plus a default whose local name is not already named 📋
 *
 * Order is entry, then name. A missing relevant subpath throws: the list above is part of the contract.
 *
 * @param { string } root
 * @returns { PublicExport[] }
 */
export function relevantExports(root: string): PublicExport[] {
  if (cache?.root === root) return cache.rows;
  const project = new Project({
    compilerOptions: { strict: true, target: 99, module: 99, moduleResolution: 100, jsx: 4, esModuleInterop: true, skipLibCheck: true },
    skipAddingFilesFromTsConfig: true,
  });
  const maps = new Map<string, Map<string, string>>();
  const rows: PublicExport[] = [];
  for (const spec of RELEVANT_EXPORTS) {
    const map = maps.get(spec.packageName) ?? exportMap(root, spec.packageName);
    maps.set(spec.packageName, map);
    const target = map.get(spec.subpath);
    if (!target) throw new Error(`export-surface: ${spec.packageName} has no ${spec.subpath} export`);
    const source = project.addSourceFileAtPath(join(root, 'node_modules', spec.packageName, target.replace(/^\.\//, '')));
    const entry = `${spec.packageName}/${spec.subpath.slice(2)}`;
    const named = new Set<string>();
    let defaultLocal: string | null = null;
    for (const [name, declarations] of source.getExportedDeclarations()) {
      if (name === 'default') {
        const decl = declarations[0];
        if (decl && (Node.isVariableDeclaration(decl) || Node.isFunctionDeclaration(decl) || Node.isClassDeclaration(decl))) defaultLocal = decl.getName() ?? null;
        continue;
      }
      named.add(name);
      rows.push({ packageName: spec.packageName, entry, name, kind: 'named' });
    }
    if (defaultLocal && !named.has(defaultLocal)) rows.push({ packageName: spec.packageName, entry, name: defaultLocal, kind: 'default' });
  }
  rows.sort((a, b) => a.entry.localeCompare(b.entry) || a.name.localeCompare(b.name));
  cache = { root, rows };
  return rows;
}
