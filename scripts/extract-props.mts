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
* @name: extract-props
* @file: scripts/extract-props.mts
* @type: build script (server only, never imported by a client component)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> node --experimental-strip-types scripts/extract-props.mts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🏗️ Build-time props extraction (0.2.28). ts-morph reads the published .ts declarations once,
//    here, and writes deterministic JSON. Nothing in this file is imported by app code, so the
//    TypeScript compiler never reaches a browser bundle. There is no eval and no runtime type walk.

// import the filesystem helpers 📁
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// import the path helpers 🧭
import { dirname, join, relative } from 'node:path';
// import ts-morph (types only live in this build script) 🔎
import { Node, Project, SyntaxKind, type ArrowFunction, type FunctionDeclaration, type FunctionExpression, type InterfaceDeclaration, type SourceFile, type Type } from 'ts-morph';
// import the published export map (consumer paths, not source files) 📦
import { relevantExports, type PublicExport } from './export-surface.mts';

// 🧾 a default the table can tell apart: nothing declared, a literal we could print, or a value we refused to guess
export type ExtractedDefault =
  | { kind: 'none' }
  | { kind: 'unknown' }
  | { kind: 'value'; value: string };

// 🧾 one row, shaped for AbPropsTable (the description may also mention an alias or a base interface)
export type ExtractedRow = {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  deprecated?: string;
  default?: ExtractedDefault;
  // 🏷️ where that default came from. AbPropsTable still renders only none / unknown / value.
  defaultSource?: 'declared' | 'effective' | 'comment';
};

// 🧾 one documented symbol
export type ExtractedSymbol = {
  id: string;
  name: string;
  packageName: string;
  entry: string;
  file: string;
  kind: 'props' | 'union' | 'function' | 'const' | 'alias';
  description: string;
  signature?: string;
  type?: string;
  value?: string;
  aliasOf?: string;
  rows?: ExtractedRow[];
  note?: string;
};

// 🧾 the JSON document committed next to the docs
export type PropsDocument = {
  symbols: ExtractedSymbol[];
};

// 📌 a symbol the catalog asks the extractor to read
export type CatalogEntry = {
  id: string;
  name: string;
  packageName: string;
  entry: string;
  file: string;
  page: string;
  note?: string;
};

// 🚫 a public export this pass does not turn into a page section
export type DeferredSymbol = {
  name: string;
  entry: string;
  reason: string;
};

// 🔒 a source name with no supported consumer import
export type InternalSymbol = {
  name: string;
  page: string;
  source: string;
  reason: string;
};

// 🗣️ drop credit clauses. Published comments sometimes name people; the docs do not repeat that.
const CREDIT = /\b(?:God|Joseph|Julie|Jane|James|Jeff|John|Captain|Cook)\b/;

// 📦 the symbols this pass documents. Order here is the order in the JSON and on the pages.
export const PROPS_CATALOG: readonly CatalogEntry[] = [
  // 🗄️ shared drawer contract (ab-nextjs-components/ab-drawer)
  { id: 'AbDrawerProps', name: 'AbDrawerProps', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'AbDrawerSide', name: 'AbDrawerSide', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'AbDrawerTier', name: 'AbDrawerTier', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'AbDrawerScope', name: 'AbDrawerScope', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-drawer.ts', page: 'components/drawer' },
  { id: 'AbSheetSnap', name: 'AbSheetSnap', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', page: 'components/drawer' },
  { id: 'UseAbDrawer', name: 'UseAbDrawer', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-drawer.ts', page: 'components/drawer' },
  { id: 'useAbDrawer', name: 'useAbDrawer', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-drawer.ts', page: 'components/drawer' },
  { id: 'UseAbEdgeSwipeOptions', name: 'UseAbEdgeSwipeOptions', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-edge-swipe.ts', page: 'components/drawer' },
  { id: 'useAbEdgeSwipe', name: 'useAbEdgeSwipe', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-edge-swipe.ts', page: 'components/drawer' },
  { id: 'AB_ASIDE_DRAWER_MAX_WIDTH', name: 'AB_ASIDE_DRAWER_MAX_WIDTH', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/use-ab-edge-swipe.ts', page: 'components/drawer' },
  { id: 'AB_SWIPE', name: 'AB_SWIPE', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', page: 'components/drawer' },
  { id: 'AB_DRAWER_DURATION', name: 'AB_DRAWER_DURATION', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'AB_PREVIEW_SCOPE_SELECTOR', name: 'AB_PREVIEW_SCOPE_SELECTOR', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'AB_DRAWER_RETURN_FOCUS', name: 'AB_DRAWER_RETURN_FOCUS', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'getAbDrawerHost', name: 'getAbDrawerHost', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/index.tsx', page: 'components/drawer' },
  { id: 'resolveAbSheetRelease', name: 'resolveAbSheetRelease', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', page: 'components/drawer' },
  { id: 'resolveAbSideRelease', name: 'resolveAbSideRelease', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-drawer', file: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', page: 'components/drawer' },
  // 🧱 layout slots (ab-nextjs-core). Server twins are compared and recorded as aliases when the members match.
  { id: 'AbAppLayoutProps', name: 'AbAppLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-app-layout', file: 'node_modules/ab-nextjs-core/ab-app-layout/index.tsx', page: 'core/layouts' },
  { id: 'server.AbAppLayoutProps', name: 'AbAppLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/server/ab-app-layout', file: 'node_modules/ab-nextjs-core/server/ab-app-layout/index.tsx', page: 'core/layouts' },
  { id: 'AbMainLayoutProps', name: 'AbMainLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-main-layout', file: 'node_modules/ab-nextjs-core/ab-main-layout/index.tsx', page: 'core/layouts' },
  { id: 'server.AbMainLayoutProps', name: 'AbMainLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/server/ab-main-layout', file: 'node_modules/ab-nextjs-core/server/ab-main-layout/index.tsx', page: 'core/layouts' },
  { id: 'AbAsideLayoutProps', name: 'AbAsideLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-aside-layout', file: 'node_modules/ab-nextjs-core/ab-aside-layout/index.tsx', page: 'core/layouts' },
  { id: 'server.AbAsideLayoutProps', name: 'AbAsideLayoutProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/server/ab-aside-layout', file: 'node_modules/ab-nextjs-core/server/ab-aside-layout/index.tsx', page: 'core/layouts' },
  { id: 'AbPageContextValue', name: 'AbPageContextValue', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AbPageProviderProps', name: 'AbPageProviderProps', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'useAbPage', name: 'useAbPage', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AbAsideToggle', name: 'AbAsideToggle', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'useAbAsideToggle', name: 'useAbAsideToggle', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AbAsideDrawer', name: 'AbAsideDrawer', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'useAbAsideDrawer', name: 'useAbAsideDrawer', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'useAbInlineScroller', name: 'useAbInlineScroller', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AB_ASIDE_DURATION', name: 'AB_ASIDE_DURATION', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AB_ASIDE_SHEET_QUERY', name: 'AB_ASIDE_SHEET_QUERY', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'getAbAsideDuration', name: 'getAbAsideDuration', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'AB_REDUCED_MOTION_QUERY', name: 'AB_REDUCED_MOTION_QUERY', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-page-provider', file: 'node_modules/ab-nextjs-core/ab-page-provider/index.tsx', page: 'core/layouts' },
  { id: 'shouldCloseAbAsideOnSwipe', name: 'shouldCloseAbAsideOnSwipe', packageName: 'ab-nextjs-core', entry: 'ab-nextjs-core/ab-aside-layout', file: 'node_modules/ab-nextjs-core/ab-aside-layout/index.tsx', page: 'core/layouts' },
  // 🔭 scroll spy (ab-nextjs-hooks). getAbMainScroller is components, listed with this page on purpose.
  { id: 'UseAbScrollSpyOptions', name: 'UseAbScrollSpyOptions', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'useAbScrollSpy', name: 'useAbScrollSpy', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'ScrollToAbSectionOptions', name: 'ScrollToAbSectionOptions', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'scrollToAbSection', name: 'scrollToAbSection', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'AB_SCROLL_SPY_ROOT_MARGIN', name: 'AB_SCROLL_SPY_ROOT_MARGIN', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'AB_SCROLL_SPY_PANE_ROOT_MARGIN', name: 'AB_SCROLL_SPY_PANE_ROOT_MARGIN', packageName: 'ab-nextjs-hooks', entry: 'ab-nextjs-hooks/useAbScrollSpy', file: 'node_modules/ab-nextjs-hooks/useAbScrollSpy.ts', page: 'hooks/scroll-spy' },
  { id: 'getAbMainScroller', name: 'getAbMainScroller', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-toc', file: 'node_modules/ab-nextjs-components/ab-toc/index.tsx', page: 'hooks/scroll-spy', note: 'Exported from ab-nextjs-components/ab-toc. It is not a core export.' },
  { id: 'AB_MAIN_SCROLLER_SELECTOR', name: 'AB_MAIN_SCROLLER_SELECTOR', packageName: 'ab-nextjs-components', entry: 'ab-nextjs-components/ab-toc', file: 'node_modules/ab-nextjs-components/ab-toc/index.tsx', page: 'hooks/scroll-spy', note: 'The selector getAbMainScroller reads. Also from ab-nextjs-components/ab-toc, not core.' },
];

// 🔒 source names that are not a consumer import. `source` is provenance for the audit, not an import path.
export const INTERNAL_SYMBOLS: readonly InternalSymbol[] = [
  { name: 'AbSheetRelease', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'Declared beside resolveAbSheetRelease. ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'AbSheetReleaseInput', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'Parameter type of resolveAbSheetRelease. ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'AbSideReleaseInput', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'Parameter type of resolveAbSideRelease. ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'isInAbEdgeZone', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'createAbVelocityTracker', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'isInAbHorizontalScroller', page: 'components/drawer', source: 'node_modules/ab-nextjs-components/ab-drawer/gestures.ts', reason: 'ab-nextjs-components/ab-drawer does not re-export it, and no exports entry points at its source file.' },
  { name: 'toAbSlot', page: 'core/layouts', source: 'node_modules/ab-nextjs-core/ab-page-provider/slot.ts', reason: 'Used by the layout implementations. ab-nextjs-core/ab-page-provider does not export it, and no exports entry points at its source file.' },
  { name: 'AbScrollRegistrar', page: 'core/layouts', source: 'node_modules/ab-nextjs-core/ab-page-provider/scroll-registrar.tsx', reason: 'Used by the server layouts. ab-nextjs-core/ab-page-provider does not export it, and no exports entry points at its source file.' },
  { name: 'AbScrollRegistrarProps', page: 'core/layouts', source: 'node_modules/ab-nextjs-core/ab-page-provider/scroll-registrar.tsx', reason: 'Props of AbScrollRegistrar. ab-nextjs-core/ab-page-provider does not export it, and no exports entry points at its source file.' },
  { name: 'AbMainBarHeight', page: 'core/layouts', source: 'node_modules/ab-nextjs-core/ab-main-layout/main-bar-height.tsx', reason: 'Rendered inside the main layout. ab-nextjs-core/ab-main-layout does not export it, and no exports entry points at its source file.' },
];

// 🗣️ a public name this pass does not turn into a section. The inventory fills the rest from the export map.
const DEFERRED_REASONS: Readonly<Record<string, string>> = {
  'ab-nextjs-components/ab-drawer#AbDrawer': 'The component value. Its props are AbDrawerProps on this page.',
  'ab-nextjs-components/ab-nav-drawer#AbNavDrawerProps': 'Product drawer props. This pass documents the shared drawer contract, not each product drawer.',
  'ab-nextjs-components/ab-bottom-drawer#AbBottomDrawerProps': 'Product drawer props. This pass documents the shared drawer contract, not each product drawer.',
  'ab-nextjs-components/ab-toc#AbTocPromoProps': 'Outline promo props. This pass only documents getAbMainScroller and its selector from this entry.',
  'ab-nextjs-components/ab-toc-drawer#AbTocDrawerLink': 'Product drawer link shape. This pass does not add a page for the outline drawer.',
  'ab-nextjs-core/ab-app-layout#acquireAbLayoutLock': 'Public helper, not a layout slot. This pass documents the slot props.',
  'ab-nextjs-components/ab-toc#AbToc': 'Outline chrome. This pass only documents getAbMainScroller and its selector from this entry.',
  'ab-nextjs-components/ab-toc#AbTocProps': 'Outline chrome, not the scroller helper.',
  'ab-nextjs-components/ab-toc#AbTocItem': 'Outline item shape, not the scroller helper.',
  'ab-nextjs-components/ab-toc#AbTocPromo': 'Aside promo card, not the scroller helper.',
};


/**
 * `sanitizeDoc` - one line of public description, with credit clauses removed 🧹
 *
 * @param { string } text
 * @returns { string }
 */
export function sanitizeDoc(text: string): string {
  // 🔗 `{@link Name}` becomes the name
  const unlinked = text.replace(/\{@link\s+([^}]+)\}/g, '$1');
  // 🗣️ drop a parenthetical that only exists to credit someone
  const uncredited = unlinked.replace(/\([^)]*\b(?:God|Joseph|Julie|Jane|James|Jeff|John|Captain|Cook)\b[^)]*\)/g, '');
  // ✂️ drop a sentence that still names someone
  const sentences = uncredited.split(/(?<=[.!?])\s+/).filter((part) => part.trim() && !CREDIT.test(part));
  // 🧽 one line, and drop markdown backticks (the table prints plain text)
  return sentences.join(' ').replace(/`([^`\n]+)`/g, '$1').replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}


/**
 * `commentDefault` - what a comment claims the default is 🏷️
 *
 * `none` is only the explicit word "none" (no value). A conditional sentence is `unknown`,
 * never a guessed literal. A single token is `value`.
 *
 * @param { string } text
 * @returns { ExtractedDefault | null } null when the comment never mentions a default
 */
export function commentDefault(text: string): ExtractedDefault | null {
  // 🔎 the clause after "default"
  const clause = /(?:\(|\b)default:?\s+([^)]*)/i.exec(text);
  if (!clause) return null; // 🫥
  const body = clause[1].trim();
  // ⛔ "default: none" means the prop is absent, not the string none
  if (/^none\b/i.test(body)) return { kind: 'none' };
  // ❓ more than one code span, or a condition, is not a single value
  const spans = body.match(/`[^`]+`/g) ?? [];
  if (spans.length > 1 || /\b(when|for the|if |unless)\b/i.test(body)) return { kind: 'unknown' };
  // ✅ one backticked token
  if (spans.length === 1 && /^`[^`]+`[. ]*$/.test(body)) return { kind: 'value', value: spans[0].slice(1, -1) };
  // ✅ a bare literal
  const literal = /^(true|false|null|-?\d+(?:\.\d+)?)[. ]*$/i.exec(body);
  if (literal) return { kind: 'value', value: literal[1] };
  // ❓ it mentioned a default and we will not invent one
  return { kind: 'unknown' };
}


/**
 * `initializerDefault` - a binding initializer, printed only when it is data 🔢
 *
 * @param { Node } node
 * @returns { ExtractedDefault }
 */
export function initializerDefault(node: Node): ExtractedDefault {
  // ✅ literals, identifiers (a named constant), and arrays/objects made of those
  const data = (n: Node): boolean => {
    if (Node.isStringLiteral(n) || Node.isNumericLiteral(n) || Node.isTrueLiteral(n) || Node.isFalseLiteral(n) || Node.isNullLiteral(n)) return true;
    if (Node.isIdentifier(n) || Node.isNoSubstitutionTemplateLiteral(n)) return true;
    if (Node.isPrefixUnaryExpression(n) && n.getOperatorToken() === SyntaxKind.MinusToken && Node.isNumericLiteral(n.getOperand())) return true;
    if (Node.isAsExpression(n)) return data(n.getExpression());
    if (Node.isArrayLiteralExpression(n)) return n.getElements().every(data);
    if (Node.isObjectLiteralExpression(n)) return n.getProperties().every((p) => Node.isPropertyAssignment(p) && data(p.getInitializerOrThrow()));
    return false; // ❓ a call, a conditional, a spread
  };
  return data(node) ? { kind: 'value', value: node.getText() } : { kind: 'unknown' };
}


// 🧲 a function whose parameter type actually names the interface (not every `options` in the file)
type TypedFn = FunctionDeclaration | ArrowFunction | FunctionExpression;

/**
 * `functionsForType` - functions that take this type, and no others 🎯
 *
 * @param { SourceFile } source
 * @param { string } typeName
 * @returns { TypedFn[] }
 */
function functionsForType(source: SourceFile, typeName: string): TypedFn[] {
  const typed = (fn: TypedFn): boolean => fn.getParameters().some((p) => (p.getTypeNode()?.getText() ?? '').includes(typeName));
  const out: TypedFn[] = source.getFunctions().filter(typed);
  for (const variable of source.getVariableDeclarations()) {
    const init = variable.getInitializer();
    if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) && typed(init)) out.push(init);
  }
  return out;
}


/**
 * `nullishProps` - `options.a ?? options.b ?? null` → those property names and the final literal 🧮
 *
 * A conditional or any other expression is not a single fallback, so the whole chain is refused.
 *
 * @param { Node } expr
 * @param { string } param
 * @returns { { props: string[]; terminal: string | null } | null }
 */
function nullishProps(expr: Node, param: string): { props: string[]; terminal: string | null } | null {
  const node = Node.isParenthesizedExpression(expr) || Node.isAsExpression(expr) ? expr.getExpression() : expr;
  if (Node.isBinaryExpression(node) && node.getOperatorToken().getKind() === SyntaxKind.QuestionQuestionToken) {
    const left = nullishProps(node.getLeft(), param);
    const right = nullishProps(node.getRight(), param);
    if (!left || !right || (left.terminal && right.terminal)) return null;
    return { props: [...left.props, ...right.props], terminal: right.terminal ?? left.terminal };
  }
  if (Node.isPropertyAccessExpression(node) && node.getExpression().getText() === param) return { props: [node.getName()], terminal: null };
  if (Node.isNullLiteral(node) || Node.isStringLiteral(node) || Node.isNumericLiteral(node) || Node.isTrueLiteral(node) || Node.isFalseLiteral(node)) {
    return { props: [], terminal: node.getText() };
  }
  return null;
}


/**
 * `bindingDefaults` - declared initializers and effective literal fallbacks, only on functions of this type 🧲
 *
 * @param { SourceFile } source
 * @param { string } typeName
 * @returns { { declared: Map<string, ExtractedDefault>; effective: Map<string, ExtractedDefault> } }
 */
function bindingDefaults(source: SourceFile, typeName: string): { declared: Map<string, ExtractedDefault>; effective: Map<string, ExtractedDefault> } {
  const declared = new Map<string, ExtractedDefault>();
  const effective = new Map<string, ExtractedDefault>();
  const take = (pattern: Node): void => {
    if (!Node.isObjectBindingPattern(pattern)) return;
    for (const el of pattern.getElements()) {
      const init = el.getInitializer();
      if (!init) continue; // ⛔ no initializer → the comment or an effective fallback decides later
      declared.set(el.getName(), initializerDefault(init));
    }
  };
  for (const fn of functionsForType(source, typeName)) {
    const param = fn.getParameters().find((p) => (p.getTypeNode()?.getText() ?? '').includes(typeName));
    if (!param) continue;
    const nameNode = param.getNameNode();
    if (Node.isObjectBindingPattern(nameNode)) take(nameNode);
    const body = fn.getBody();
    if (!body || !Node.isBlock(body) || !Node.isIdentifier(nameNode)) continue;
    const paramName = nameNode.getText();
    for (const stmt of body.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
      // 🧲 only `const { a = 1 } = options`, not a destructure of some other value
      if (Node.isObjectBindingPattern(stmt.getNameNode()) && stmt.getInitializer()?.getText() === paramName) take(stmt.getNameNode());
    }
    for (const binary of body.getDescendantsOfKind(SyntaxKind.BinaryExpression)) {
      if (binary.getOperatorToken().getKind() !== SyntaxKind.QuestionQuestionToken) continue;
      if (binary.getParent()?.getKind() === SyntaxKind.BinaryExpression) continue; // 🪜 the outermost ?? owns the chain
      const chain = nullishProps(binary, paramName);
      if (!chain?.terminal) continue;
      for (const prop of chain.props) {
        if (!declared.has(prop) && !effective.has(prop)) effective.set(prop, { kind: 'value', value: chain.terminal });
      }
    }
  }
  return { declared, effective };
}


/**
 * `typeText` - a type's text without `import("…")` wrappers 🔤
 *
 * @param { Type } type
 * @param { Node } at
 * @returns { string }
 */
function typeText(type: Type, at: Node): string {
  // ✂️ `import("react").ReactNode` → `ReactNode`
  return type.getText(at).replace(/import\([^)]*\)\./g, '');
}


/**
 * `rowsOfInterface` - own properties, then each extended interface, in source order 📋
 *
 * @param { InterfaceDeclaration } decl
 * @param { Map<string, ExtractedDefault> } bindings
 * @returns { ExtractedRow[] }
 */
/**
 * `baseInterfaces` - every interface this one extends, including a base's base, without looping 🧬
 *
 * @param { InterfaceDeclaration } decl
 * @returns { InterfaceDeclaration[] }
 */
function baseInterfaces(decl: InterfaceDeclaration): InterfaceDeclaration[] {
  const out: InterfaceDeclaration[] = [];
  const seen = new Set<InterfaceDeclaration>([decl]);
  const queue = [decl];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    for (const type of current.getBaseTypes()) {
      const face = type.getSymbol()?.getDeclarations()?.find(Node.isInterfaceDeclaration);
      if (!face || seen.has(face)) continue; // 🔁 a cycle, or a type operator such as Omit
      seen.add(face);
      out.push(face);
      queue.push(face);
    }
  }
  return out;
}


function rowsOfInterface(decl: InterfaceDeclaration, bindings: { declared: Map<string, ExtractedDefault>; effective: Map<string, ExtractedDefault> }): ExtractedRow[] {
  // 🧬 the interface itself, then each extended interface, walking the chain
  const faces = [decl, ...baseInterfaces(decl)];
  const rows: ExtractedRow[] = [];
  const seen = new Set<string>();
  for (const face of faces) {
    for (const prop of face.getProperties()) {
      const name = prop.getName();
      if (seen.has(name)) continue; // 🥇 the first declaration wins (the child overrides the base)
      seen.add(name);
      const docs = prop.getJsDocs().map((d) => d.getDescription().trim()).filter(Boolean).join(' ');
      const trail = prop.getTrailingCommentRanges().map((r) => r.getText().replace(/^\/\/\s?/, '').trim()).join(' ');
      const description = sanitizeDoc([docs, trail].filter(Boolean).join(' '));
      const deprecatedTag = prop.getJsDocs().flatMap((d) => d.getTags()).find((t) => t.getTagName() === 'deprecated');
      const rawDeprecated = deprecatedTag?.getCommentText() ?? '';
      // 🪞 read the alias before backticks are stripped for display
      const alias = /use `([^`]+)`/.exec(rawDeprecated)?.[1];
      const deprecated = deprecatedTag ? sanitizeDoc(rawDeprecated || 'Deprecated') : undefined;
      const fromComment = commentDefault(`${docs} ${trail} ${deprecated ?? ''}`);
      const fromCode = bindings.declared.get(name);
      const fromEffect = bindings.effective.get(name);
      // 🥇 a real initializer beats an effective fallback, which beats a comment. "none" stays none.
      const chosen: ExtractedDefault = fromCode ?? fromEffect ?? fromComment ?? { kind: 'none' };
      const defaultSource = fromCode ? 'declared' : fromEffect ? 'effective' : fromComment && fromComment.kind !== 'none' ? 'comment' : undefined;
      let text = description;
      if (defaultSource === 'effective' && chosen.kind === 'value') {
        text = [text, `Effective fallback when omitted: ${chosen.value}. Not a declared initializer.`].filter(Boolean).join(' ');
      }
      const row: ExtractedRow = {
        name,
        type: typeText(prop.getType(), prop),
        ...(prop.hasQuestionToken() ? {} : { required: true }),
        ...(text ? { description: alias ? `${text} Alias of ${alias}.` : text } : alias ? { description: `Alias of ${alias}.` } : {}),
        ...(deprecated ? { deprecated } : {}),
        default: chosen,
        ...(defaultSource ? { defaultSource } : {}),
      };
      if (face !== decl) row.description = [row.description, `Inherited from ${face.getName()}.`].filter(Boolean).join(' ');
      rows.push(row);
    }
  }
  return rows;
}


/**
 * `sameLineComment` - the `//` note on the declaration's own line, not the next line's 💬
 *
 * @param { Node } node
 * @returns { string }
 */
function sameLineComment(node: Node): string {
  // 📄 from the end of the node to the line break (the comma and the comment sit there)
  const text = node.getSourceFile().getFullText();
  const end = node.getEnd();
  const lineEnd = text.indexOf('\n', end);
  const rest = text.slice(end, lineEnd === -1 ? text.length : lineEnd);
  return (/\/\/\s*(.*)$/.exec(rest)?.[1] ?? '').trim();
}


/**
 * `extractName` - one named declaration in a file 🔎
 *
 * @param { SourceFile } source
 * @param { CatalogEntry } entry
 * @param { string } root
 * @returns { ExtractedSymbol }
 */
function extractName(source: SourceFile, entry: CatalogEntry, root: string): ExtractedSymbol {
  // 🧭 repo-relative path, so the JSON does not contain a machine path
  const file = relative(root, source.getFilePath());
  const base = { id: entry.id, name: entry.name, packageName: entry.packageName, entry: entry.entry, file, description: '', ...(entry.note ? { note: entry.note } : {}) };
  const face = source.getInterface(entry.name);
  if (face) {
    const bindings = bindingDefaults(source, entry.name);
    return { ...base, kind: 'props', description: sanitizeDoc(face.getJsDocs().map((d) => d.getDescription()).join(' ')), rows: rowsOfInterface(face, bindings) };
  }
  const alias = source.getTypeAlias(entry.name);
  if (alias) {
    const text = alias.getTypeNode()?.getText() ?? '';
    const target = /^[A-Z][A-Za-z0-9_]*$/.exec(text)?.[0];
    return { ...base, kind: target ? 'alias' : 'union', description: sanitizeDoc(alias.getJsDocs().map((d) => d.getDescription()).join(' ')), type: text, ...(target ? { aliasOf: target } : {}) };
  }
  const fn = source.getFunction(entry.name);
  if (fn) {
    const signature = `${fn.getName()}(${fn.getParameters().map((p) => p.getText()).join(', ')}): ${fn.getReturnTypeNode()?.getText() ?? typeText(fn.getReturnType(), fn)}`;
    const rows: ExtractedRow[] = fn.getParameters().map((p) => {
      const init = p.getInitializer();
      return {
        name: p.getName(),
        type: p.getTypeNode()?.getText() ?? typeText(p.getType(), p),
        ...(p.hasQuestionToken() || p.isOptional() ? {} : init ? {} : { required: true }),
        description: sanitizeDoc((p as { getJsDocs?: () => { getDescription(): string }[] }).getJsDocs?.().map((d) => d.getDescription()).join(' ') ?? ''),
        default: init ? initializerDefault(init) : { kind: 'none' },
      };
    });
    return { ...base, kind: 'function', description: sanitizeDoc(fn.getJsDocs().map((d) => d.getDescription()).join(' ')), signature, rows };
  }
  const variable = source.getVariableDeclaration(entry.name);
  if (variable) {
    const rawInit = variable.getInitializer();
    // 🪞 `as const` wraps the value; the object underneath is what the rows come from
    const init = rawInit && Node.isAsExpression(rawInit) ? rawInit.getExpression() : rawInit;
    const typeNode = variable.getTypeNode()?.getText();
    const description = sanitizeDoc(variable.getVariableStatement()?.getJsDocs().map((d) => d.getDescription()).join(' ') ?? '');
    // 🧱 a const object becomes rows (one per field) plus the printed value
    if (init && Node.isObjectLiteralExpression(init)) {
      const rows: ExtractedRow[] = init.getProperties().flatMap((p) => {
        if (!Node.isPropertyAssignment(p)) return [];
        const value = p.getInitializer();
        return [{
          name: p.getName(),
          type: value ? typeText(value.getType(), value) : 'unknown',
          description: sanitizeDoc(sameLineComment(p)),
          default: value ? initializerDefault(value) : { kind: 'unknown' },
        }];
      });
      return { ...base, kind: 'const', description, type: typeNode, value: init.getText(), rows };
    }
    return { ...base, kind: 'const', description, type: typeNode ?? (init ? typeText(init.getType(), init) : undefined), ...(init ? { value: initializerDefault(init).kind === 'value' ? init.getText() : undefined } : {}), rows: undefined };
  }
  throw new Error(`extract-props: ${entry.name} was not found in ${file}`);
}


/**
 * `markServerAliases` - when a server layout declares the same members, point at the client symbol 🪞
 *
 * @param { ExtractedSymbol[] } symbols
 * @returns { ExtractedSymbol[] }
 */
export function markServerAliases(symbols: ExtractedSymbol[]): ExtractedSymbol[] {
  // 🪞 compare the prop shape, not the prose (comments can differ by a word)
  const shape = (rows: ExtractedRow[] = []) => JSON.stringify(rows.map((r) => ({ name: r.name, type: r.type, required: r.required ?? false, default: r.default, deprecated: r.deprecated ?? null })));
  return symbols.map((symbol) => {
    if (!symbol.id.startsWith('server.')) return symbol;
    const client = symbols.find((other) => other.name === symbol.name && other.id === symbol.name);
    if (!client || shape(client.rows) !== shape(symbol.rows)) return symbol;
    return { ...symbol, kind: 'alias', aliasOf: client.id, note: `Server entry. Same members as ${client.entry}.` };
  });
}


/**
 * `extractCatalog` - every catalog entry, in catalog order 📚
 *
 * @param { readonly CatalogEntry[] } catalog
 * @param { string } root
 * @param { Project } [project]
 * @returns { PropsDocument }
 */
export function extractCatalog(catalog: readonly CatalogEntry[], root: string, project = new Project({
  compilerOptions: { strict: true, target: 99, module: 99, moduleResolution: 100, jsx: 4, esModuleInterop: true, skipLibCheck: true },
  skipAddingFilesFromTsConfig: true,
})): PropsDocument {
  // 📁 one source file object per path
  const files = new Map<string, SourceFile>();
  const load = (file: string): SourceFile => {
    const abs = join(root, file);
    const hit = files.get(abs);
    if (hit) return hit;
    const next = project.addSourceFileAtPath(abs);
    files.set(abs, next);
    return next;
  };
  const symbols = markServerAliases(catalog.map((entry) => extractName(load(entry.file), entry, root)));
  return { symbols };
}


/**
 * `serializeProps` - stable JSON (two-space, trailing newline, catalog order) 📄
 *
 * @param { PropsDocument } doc
 * @returns { string }
 */
export function serializeProps(doc: PropsDocument): string {
  return `${JSON.stringify(doc, null, 2)}\n`;
}


/**
 * `extractFixture` - run the same extractor on an in-memory fixture 🧪
 *
 * @param { string } source
 * @param { string } name
 * @returns { ExtractedSymbol }
 */
export function extractFixture(source: string, name: string): ExtractedSymbol {
  const project = new Project({
    compilerOptions: { strict: true, target: 99, jsx: 4, skipLibCheck: true },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true,
  });
  const file = project.createSourceFile('fixture.tsx', source);
  return extractName(file, { id: name, name, packageName: 'fixture', entry: 'fixture', file: 'fixture.tsx', page: 'fixture' }, '/');
}


// 📄 where the committed JSON lives
export const PROPS_JSON = 'data/props/generated.json';
export const INVENTORY_JSON = 'data/props/inventory.json';


/**
 * `buildInventory` - covered symbols plus the deferred list 🗂️
 *
 * @param { PropsDocument } doc
 * @returns { { covered: object[]; deferred: DeferredSymbol[] } }
 */
export type PropsInventory = {
  covered: object[];
  deferred: DeferredSymbol[];
  internal: readonly InternalSymbol[];
  counts: { covered: number; deferred: number; internal: number; publicExports: number };
};


/**
 * `pageOfEntry` - which of the three pages mentions a public entry 📄
 *
 * @param { string } entry
 * @returns { string }
 */
function pageOfEntry(entry: string): string {
  // 🗄️ product drawers before the plain outline entry (its name also contains "toc")
  if (/ab-(nav|toc|bottom|search|settings|confirm)-drawer|ab-drawer/.test(entry)) return 'components/drawer';
  if (entry.endsWith('/ab-toc')) return 'hooks/scroll-spy';
  if (entry.includes('useAbScrollSpy')) return 'hooks/scroll-spy';
  return 'core/layouts';
}


/**
 * `deferredReason` - why a public export has no section 🗒️
 *
 * @param { PublicExport } item
 * @param { CatalogEntry | undefined } elsewhere - the same name already documented at another entry
 * @returns { string }
 */
function deferredReason(item: PublicExport, elsewhere: CatalogEntry | undefined): string {
  const specific = DEFERRED_REASONS[`${item.entry}#${item.name}`];
  if (specific) return specific;
  if (elsewhere) return `Documented at ${elsewhere.entry}. This path exports the same name.`;
  if (item.entry.endsWith('/ab-drawer') || item.entry.endsWith('/use-ab-drawer')) return 'Public drawer export. This pass does not give it a section.';
  if (/drawer/.test(item.entry)) return 'Product drawer export. This pass documents the shared drawer contract, not this name.';
  if (item.entry.endsWith('/ab-toc')) return 'Outline chrome. This pass only documents getAbMainScroller and its selector from this entry.';
  if (item.entry.startsWith('ab-nextjs-core/')) return 'Public core export. This pass documents the layout slots and the page provider, not this name.';
  return 'Public export of this entry. This pass does not give it a section.';
}


/**
 * `buildInventory` - covered, deferred and internal counts, taken from the lists themselves 🗂️
 *
 * Every relevant public export is either covered or deferred. Internal names are not public exports.
 *
 * @param { PropsDocument } doc
 * @param { string } [root]
 * @returns { PropsInventory }
 */
export function buildInventory(doc: PropsDocument, root = process.cwd()): PropsInventory {
  const covered = doc.symbols.map((symbol) => ({
    id: symbol.id,
    name: symbol.name,
    packageName: symbol.packageName,
    entry: symbol.entry,
    kind: symbol.kind,
    aliasOf: symbol.aliasOf ?? null,
    page: PROPS_CATALOG.find((entry) => entry.id === symbol.id)?.page ?? null,
    note: symbol.note ?? null,
    props: symbol.rows?.length ?? 0,
  }));
  const coveredKey = new Set(PROPS_CATALOG.map((entry) => `${entry.entry}#${entry.name}`));
  const surface = relevantExports(root);
  const deferred: DeferredSymbol[] = [];
  for (const item of surface) {
    if (coveredKey.has(`${item.entry}#${item.name}`)) continue;
    const elsewhere = PROPS_CATALOG.find((entry) => entry.name === item.name && entry.packageName === item.packageName && entry.entry !== item.entry);
    deferred.push({ name: item.name, entry: item.entry, reason: deferredReason(item, elsewhere) });
  }
  return {
    covered,
    deferred,
    internal: INTERNAL_SYMBOLS,
    counts: { covered: covered.length, deferred: deferred.length, internal: INTERNAL_SYMBOLS.length, publicExports: surface.length },
  };
}


// 📝 the three API pages. Each one says, in the first paragraph, that it is not the whole package.
const PAGE_COPY: Readonly<Record<string, { file: string; frontmatter: string; intro: string }>> = {
  'components/drawer': {
    file: 'content/docs/en/packages/components/drawer.mdx',
    frontmatter: `---
title: Drawer
description: "Props, sides, tiers, scopes, hooks and helpers of the shared drawer."
package: ab-nextjs-components
kind: client
status: stable
icon: widgets
---`,
    intro: `These tables are the shared drawer contract from \`ab-nextjs-components/ab-drawer\`: props, sides, tiers, scopes, the hooks, and the gesture helpers. They are not every drawer in the package. Product drawers (navigation, outline, search, settings) are separate components and are listed under **Not on this page**.`,
  },
  'core/layouts': {
    file: 'content/docs/en/packages/core/layouts.mdx',
    frontmatter: `---
title: Layout slots
description: "Slot props for the app, main and aside layouts, plus the page provider."
package: ab-nextjs-core
kind: client
status: stable
icon: dashboard_customize
---`,
    intro: `These tables are the slot props of \`AbAppLayout\`, \`AbMainLayout\` and \`AbAsideLayout\`, and the page-provider API next to them (\`useAbPage\`). A heading marked server is that package's server entry. It declares the same members as the client entry, so the members are not repeated. \`getAbMainScroller\` is not a core export. It lives on [Scroll spy](/docs/packages/hooks/scroll-spy), from \`ab-nextjs-components/ab-toc\`.`,
  },
  'hooks/scroll-spy': {
    file: 'content/docs/en/packages/hooks/scroll-spy.mdx',
    frontmatter: `---
title: Scroll spy
description: "useAbScrollSpy, scrollToAbSection, and the main-scroller helper from components."
package: ab-nextjs-hooks
kind: client
status: stable
icon: webhook
---`,
    intro: `These tables are \`useAbScrollSpy\`, \`scrollToAbSection\`, their options, and the two root-margin constants. \`getAbMainScroller\` and \`AB_MAIN_SCROLLER_SELECTOR\` are documented here too, and they are exported from \`ab-nextjs-components/ab-toc\`, not from core. This page is not the whole hooks package.`,
  },
};


/**
 * `pagesMarkdown` - the MDX for one API page, headings included so the outline can see them 📄
 *
 * @param { string } page
 * @param { PropsDocument } doc
 * @returns { string }
 */
/**
 * `headingFor` - client and server twins must not share a heading, or the outline cannot tell them apart 🧭
 *
 * @param { ExtractedSymbol } symbol
 * @returns { string }
 */
function headingFor(symbol: ExtractedSymbol): string {
  if (symbol.id.startsWith('server.')) return `${symbol.name} (server)`;
  if (PROPS_CATALOG.some((entry) => entry.id === `server.${symbol.id}`)) return `${symbol.name} (client)`;
  return symbol.name;
}


export function pagesMarkdown(page: string, doc: PropsDocument): string {
  const copy = PAGE_COPY[page];
  if (!copy) throw new Error(`extract-props: no page copy for ${page}`);
  const inventory = buildInventory(doc);
  const symbols = doc.symbols.filter((symbol) => PROPS_CATALOG.find((entry) => entry.id === symbol.id)?.page === page);
  const sections = symbols.map((symbol) => {
    const where = `\`${symbol.entry}\``;
    return `## ${headingFor(symbol)}\n\n${where}${symbol.note ? ` ${symbol.note}` : ''}\n\n<PropsTable id="${symbol.id}" />\n`;
  });
  const deferred = inventory.deferred.filter((item) => pageOfEntry(item.entry) === page);
  const internal = inventory.internal.filter((item) => item.page === page);
  const deferredList = deferred.map((item) => `- \`${item.name}\` (\`${item.entry}\`) — ${item.reason}`).join('\n');
  // 🔒 names only. The source file stays in the inventory, not in the page a reader imports from.
  const internalList = internal.map((item) => `- \`${item.name}\` — ${item.reason}`).join('\n');
  const internalSection = internalList ? `\n## Not a public import\n\nThese names are not exported from a package entry. There is no supported import path.\n\n${internalList}\n` : '';
  return `${copy.frontmatter}\n\n${copy.intro}\n\n${sections.join('\n')}\n## Not on this page\n\n${deferredList}\n${internalSection}`;
}


// 🏃 writing the JSON is the CLI. Importing this module from a test does not write.
const isCli = process.argv[1]?.endsWith('extract-props.mts');
if (isCli) {
  const root = process.cwd();
  const doc = extractCatalog(PROPS_CATALOG, root);
  const propsPath = join(root, PROPS_JSON);
  const inventoryPath = join(root, INVENTORY_JSON);
  mkdirSync(dirname(propsPath), { recursive: true });
  writeFileSync(propsPath, serializeProps(doc));
  writeFileSync(inventoryPath, `${JSON.stringify(buildInventory(doc), null, 2)}\n`);
  for (const page of Object.keys(PAGE_COPY)) {
    const mdxPath = join(root, PAGE_COPY[page].file);
    mkdirSync(dirname(mdxPath), { recursive: true });
    writeFileSync(mdxPath, pagesMarkdown(page, doc));
  }
  // 🛡️ refuse to ship a description that still names someone
  const banned = serializeProps(doc).match(/\b(?:God|Joseph|Julie|Jane|James|Jeff|John|Captain|Cook)\b/);
  if (banned) throw new Error(`extract-props: description still contains ${banned[0]}`);
  console.log(`extract-props: ${doc.symbols.length} symbols → ${PROPS_JSON}`);
}

// 🤫 keep readFileSync referenced for the stale-file helper below (tests import it)
export function readGenerated(root = process.cwd()): string {
  return readFileSync(join(root, PROPS_JSON), 'utf8');
}
