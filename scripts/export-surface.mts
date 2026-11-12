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


// 📖 one name a guide sample imports
export type GuideImportName = { name: string; kind: 'named' | 'default' | 'namespace' };

// 🧠 one project for the guide check (a new project per file re-parses the same graph)
let guideProject: Project | null = null;


/**
 * `guidePackageSpecifier` - `ab-nextjs-core/ab-app-layout` → package + exports key 📦
 *
 * @param { string } specifier
 * @returns { { packageName: string; subpath: string } | null }
 */
export function guidePackageSpecifier(specifier: string): { packageName: string; subpath: string } | null {
  // 📦 only the Ab packages (react and next are not this check)
  if (!specifier.startsWith('ab-nextjs-')) return null;
  // ✂️ the package name is two segments (`ab-nextjs-core`); the rest is the subpath
  const parts = specifier.split('/'); // ✂️
  // 📦 `ab-nextjs-hooks` is one path segment (the hyphen is part of the name)
  const packageName = parts[0] ?? '';
  const rest = parts.slice(1).join('/');
  // 🧭 `.` is the package root; `./ab-app-layout` is a subpath key
  return { packageName, subpath: rest ? `./${rest}` : '.' };
}


/**
 * `exportedNamesOf` - named exports and whether a default exists, for one file on disk 📋
 *
 * @param { string } file
 * @returns { { named: Set<string>; hasDefault: boolean } }
 */
function exportedNamesOf(file: string): { named: Set<string>; hasDefault: boolean } {
  // 🧠 reuse one project so later files share the graph already parsed
  if (!guideProject) {
    guideProject = new Project({
      compilerOptions: { strict: true, target: 99, module: 99, moduleResolution: 100, jsx: 4, esModuleInterop: true, skipLibCheck: true },
      skipAddingFilesFromTsConfig: true,
    });
  }
  // 📖 the source (add once)
  const source = guideProject.getSourceFile(file) ?? guideProject.addSourceFileAtPath(file);
  const named = new Set<string>();
  let hasDefault = false;
  for (const [name] of source.getExportedDeclarations()) {
    if (name === 'default') hasDefault = true; // 📦
    else named.add(name); // 🏷️
  }
  // 📋 both
  return { named, hasDefault };
}


/**
 * `checkGuideImport` - one sample import against the published exports map 🛂
 *
 * A package with no `exports` field may only be imported at its root (`main`). A file on disk is not a subpath.
 * Returns null when the import is a real public export, or a short reason when it is not.
 *
 * @param { string } root
 * @param { string } specifier
 * @param { readonly GuideImportName[] } names
 * @returns { string | null }
 */
export function checkGuideImport(root: string, specifier: string, names: readonly GuideImportName[]): string | null {
  // 🧭 split the specifier
  const spec = guidePackageSpecifier(specifier);
  if (!spec) return null; // 🙅 not an Ab import
  // 📖 package.json
  const pkg = JSON.parse(readFileSync(join(root, 'node_modules', spec.packageName, 'package.json'), 'utf8')) as { exports?: Record<string, unknown>; main?: string };
  const hasExports = pkg.exports != null && typeof pkg.exports === 'object';
  // 📁 where the entry file lives
  let target: string | null = null;
  if (hasExports) {
    target = exportMap(root, spec.packageName).get(spec.subpath) ?? null; // 🗺️ only an exports key
    if (!target) return `${specifier} is not an exports key of ${spec.packageName}`;
  } else if (spec.subpath !== '.') {
    // 🚫 no exports map: a subpath is a file on disk, not a public import
    return `${spec.packageName} has no exports map, so ${specifier} is not a public import`;
  } else {
    target = pkg.main ?? 'index.ts'; // 📦 the root entry
  }
  // 🎨 a stylesheet has no named exports
  if (target.endsWith('.css') || target.endsWith('.json')) {
    if (names.length) return `${specifier} is a ${target.split('.').pop()} entry and does not export ${names.map((item) => item.name).join(', ')}`;
    return null;
  }
  // 📋 the names the file actually exports
  const exported = exportedNamesOf(join(root, 'node_modules', spec.packageName, target.replace(/^\.\//, '')));
  // 🔎 each imported name
  for (const item of names) {
    if (item.kind === 'namespace') continue; // 📦 `import * as` only needs the module
    if (item.kind === 'default' && !exported.hasDefault) return `${specifier} has no default export (${item.name})`;
    if (item.kind === 'named' && !exported.named.has(item.name)) return `${specifier} does not export ${item.name}`;
  }
  // ✅
  return null;
}


// 📖 one import found in a guide sample
export type GuideImportUse = { specifier: string; names: GuideImportName[]; where: string };


/**
 * `guideImportsIn` - every `ab-nextjs-*` import in fenced samples of a markdown / MDX string 🔎
 *
 * @param { string } source
 * @param { string } where - the file, for the error
 * @returns { GuideImportUse[] }
 */
export function guideImportsIn(source: string, where: string): GuideImportUse[] {
  // 💻 only fenced samples (prose that names a path is not an import)
  const fences = [...source.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1] ?? '');
  const uses: GuideImportUse[] = [];
  // 🚶 each fence
  for (const fence of fences) {
    // 🔗 `from '…'` and side-effect `import '…'` and CSS `@import`
    const froms = [...fence.matchAll(/from\s+['"]([^'"]+)['"]/g)];
    const sides = [...fence.matchAll(/(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)];
    const css = [...fence.matchAll(/@import\s+['"]([^'"]+)['"]/g)];
    // 📦 a from-import: recover the clause in front of `from`
    for (const match of froms) {
      const specifier = match[1] ?? '';
      if (!specifier.startsWith('ab-nextjs-')) continue; // 🙅
      const start = fence.lastIndexOf('\n', (match.index ?? 0) - 1);
      const clause = fence.slice(start + 1, match.index).replace(/^\s*import\s+(type\s+)?/, '').trim();
      const names: GuideImportName[] = [];
      // 📦 `* as Name`
      const star = /^\*\s+as\s+(\w+)/.exec(clause);
      if (star) names.push({ name: star[1] ?? '*', kind: 'namespace' });
      // 🏷️ `{ a, type b as c }`
      const braces = /\{([^}]*)\}/.exec(clause);
      if (braces) {
        for (const part of (braces[1] ?? '').split(',')) {
          const piece = part.trim().replace(/^type\s+/, '');
          if (!piece) continue;
          const alias = /^(?:\w+\s+as\s+)?(\w+)$/.exec(piece);
          const name = (piece.includes(' as ') ? piece.split(/\s+as\s+/)[0] : alias?.[1])?.trim();
          if (name) names.push({ name, kind: 'named' });
        }
      }
      // 📦 a default before the braces, or the whole clause
      const before = clause.replace(/\{[^}]*\}/, '').replace(/^\*\s+as\s+\w+/, '').replace(/,/g, '').trim();
      if (before && !before.startsWith('*')) names.push({ name: before, kind: 'default' });
      uses.push({ specifier, names, where });
    }
    // 📦 side-effect and CSS imports have no names
    for (const match of [...sides, ...css]) {
      const specifier = match[1] ?? '';
      if (specifier.startsWith('ab-nextjs-')) uses.push({ specifier, names: [], where });
    }
  }
  // 📖 the list
  return uses;
}


/**
 * `checkGuideSources` - every fenced Ab import in these sources 🛂
 *
 * @param { string } root
 * @param { readonly { file: string; source: string }[] } files
 * @returns { string[] } one line per failure
 */
export function checkGuideSources(root: string, files: readonly { file: string; source: string }[]): string[] {
  // 🚨 the failures
  const errors: string[] = [];
  // 📄 each guide
  for (const file of files) {
    for (const use of guideImportsIn(file.source, file.file)) {
      const reason = checkGuideImport(root, use.specifier, use.names); // 🛂
      if (reason) errors.push(`${file.file}: ${reason}`); // 🚨
    }
  }
  // 🚨 or none
  return errors;
}
