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
* @name: props-extract.test
* @file: tests/unit/props-extract.test.ts
* @type: test
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/props-extract.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Build-time props extraction: tricky declarations, the three default kinds, escaping, and a stale JSON file.

// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the server renderer (the table must escape text) 🖨️
import { renderToStaticMarkup } from 'react-dom/server';
// import the packaged table 📋
import AbPropsTable from 'ab-nextjs-components/ab-props-table';
// import the file reader and a second Node process (regeneration must not depend on this process) 📁
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// import the page component that hands rows to AbPropsTable 📋
import { DocsPropsTable } from '../../components/app/docs-props';
// import the extractor (build-time only) 🏗️
import {
  INTERNAL_SYMBOLS, INVENTORY_JSON, PROPS_CATALOG, PROPS_JSON, buildInventory, commentDefault, extractCatalog, extractFixture,
  markServerAliases, pagesMarkdown, sanitizeDoc, serializeProps,
} from '../../scripts/extract-props.mts';
// import the export map (a file on disk is not an import path) 📦
import { exportMap, relevantExports } from '../../scripts/export-surface.mts';

// 🧪 a fixture with inheritance, an alias, a union, a required prop, and all three default kinds
const FIXTURE = `
interface Base { /** Shared. */ id?: string }
interface Child extends Base {
  /** Count. (default \`1\`) */
  count?: number
  /** @deprecated use \`count\` */
  legacy?: boolean
  /** Default: none */
  marker?: string
  /** Default: the first item when the list is long. */
  label?: string
  must: string
}
export function demo({ count = 1, label = name() }: Child) {}
export type Side = 'left' | 'right'
export type Alias = Child
export const RATE = 240
`;

describe('props extraction 🏗️', () => {
  it('🧹 strips a credit clause and keeps the rest of the sentence', () => {
    expect(sanitizeDoc('The bar (kept for later). Default: none')).toBe('The bar (kept for later). Default: none');
    expect(sanitizeDoc('Pins the bar (God 04:16).')).toBe('Pins the bar.');
    expect(sanitizeDoc('Pins the bar (God 04:16).')).not.toMatch(/God/);
  });

  it('🏷️ tells none, unknown and value apart', () => {
    expect(commentDefault('Default: none (unchanged).')).toEqual({ kind: 'none' });
    expect(commentDefault('Default: `AB_SCROLL_SPY_ROOT_MARGIN` for the window, and another when root is set.')).toEqual({ kind: 'unknown' });
    expect(commentDefault('(default `0`)')).toEqual({ kind: 'value', value: '0' });
    expect(commentDefault('nothing was declared')).toBeNull();
  });

  it('🧬 fixtures: inherited members, aliases, required flags, and defaults', () => {
    const child = extractFixture(FIXTURE, 'Child');
    const byName = Object.fromEntries((child.rows ?? []).map((row) => [row.name, row]));
    expect(byName.must.required).toBe(true);
    expect(byName.count.required).toBeUndefined();
    expect(byName.count.default).toEqual({ kind: 'value', value: '1' });
    expect(byName.marker.default).toEqual({ kind: 'none' });
    expect(byName.label.default).toEqual({ kind: 'unknown' });
    expect(byName.legacy.deprecated).toMatch(/count/);
    expect(byName.legacy.description).toMatch(/Alias of count/);
    expect(byName.id.description).toMatch(/Inherited from Base/);
    expect(extractFixture(FIXTURE, 'Side').type).toBe("'left' | 'right'");
    expect(extractFixture(FIXTURE, 'Alias')).toMatchObject({ kind: 'alias', aliasOf: 'Child' });
    expect(extractFixture(FIXTURE, 'RATE').value).toBe('240');
  });

  it('📋 AbPropsTable escapes markup and keeps the three default kinds', () => {
    const html = renderToStaticMarkup(
      <AbPropsTable
        caption="Fixture"
        rows={[
          { name: 'marker', type: 'string', description: '<script>alert(1)</script>', default: { kind: 'none' } },
          { name: 'label', type: 'string', default: { kind: 'unknown' } },
          { name: 'count', type: 'number', default: { kind: 'value', value: '1 < 2' } },
        ]}
      />,
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('No default');
    expect(html).toContain('unknown');
    expect(html).toContain('1 &lt; 2');
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).toContain('tabindex="0"');
  });

  it('📄 the committed JSON matches a fresh extract (stale output fails)', () => {
    const fresh = serializeProps(extractCatalog(PROPS_CATALOG, process.cwd()));
    expect(readFileSync(join(process.cwd(), PROPS_JSON), 'utf8')).toBe(fresh);
    const inventory = JSON.parse(readFileSync(join(process.cwd(), INVENTORY_JSON), 'utf8')) as { covered: { id: string }[]; deferred: { name: string; entry: string }[]; internal: { name: string }[]; counts: { covered: number; deferred: number; internal: number; publicExports: number } };
    expect(inventory.covered.map((item) => item.id)).toEqual(PROPS_CATALOG.map((entry) => entry.id));
    expect(inventory.counts).toEqual({ covered: inventory.covered.length, deferred: inventory.deferred.length, internal: inventory.internal.length, publicExports: inventory.covered.length + inventory.deferred.length });
    expect(inventory.internal.map((item) => item.name)).toEqual(INTERNAL_SYMBOLS.map((item) => item.name));
    expect(fresh).not.toMatch(/\b(?:God|Joseph|Julie|Jane|James|Jeff|John|Captain|Cook)\b/);
  });

  it('📝 every covered symbol is named on its page, and the page says it is not everything', () => {
    const doc = extractCatalog(PROPS_CATALOG, process.cwd());
    for (const page of ['components/drawer', 'core/layouts', 'hooks/scroll-spy']) {
      const mdx = pagesMarkdown(page, doc);
      expect(mdx).toMatch(/not every|not the whole|not a core export|not repeated/i);
      for (const entry of PROPS_CATALOG.filter((item) => item.page === page)) expect(mdx).toContain(`id="${entry.id}"`);
    }
    expect(pagesMarkdown('hooks/scroll-spy', doc)).toContain('ab-nextjs-components/ab-toc');
    expect(pagesMarkdown('core/layouts', doc)).not.toContain('id="getAbMainScroller"');
    expect(pagesMarkdown('core/layouts', doc)).toContain('## AbAppLayoutProps (client)');
    expect(pagesMarkdown('core/layouts', doc)).toContain('## AbAppLayoutProps (server)');
    expect(pagesMarkdown('core/layouts', doc)).not.toContain('ab-nextjs-core/ab-page-provider/slot');
    expect(pagesMarkdown('components/drawer', doc)).not.toContain('ab-nextjs-components/ab-drawer/gestures');
  });

  it('📦 an exports key and a re-exported name are required, and a source file is not enough', () => {
    const root = process.cwd();
    const components = exportMap(root, 'ab-nextjs-components');
    const core = exportMap(root, 'ab-nextjs-core');
    expect(components.has('./ab-drawer/gestures')).toBe(false);
    expect(core.has('./ab-page-provider/slot')).toBe(false);
    expect(core.has('./ab-page-provider')).toBe(true);
    const surface = relevantExports(root);
    const has = (entry: string, name: string) => surface.some((item) => item.entry === entry && item.name === name);
    expect(has('ab-nextjs-components/ab-drawer', 'resolveAbSheetRelease')).toBe(true);
    expect(has('ab-nextjs-components/ab-drawer', 'AbSheetReleaseInput')).toBe(false);
    expect(has('ab-nextjs-components/ab-drawer', 'AbSideReleaseInput')).toBe(false);
    expect(has('ab-nextjs-components/ab-drawer', 'AbSheetRelease')).toBe(false);
    expect(has('ab-nextjs-core/ab-page-provider', 'toAbSlot')).toBe(false);
    expect(has('ab-nextjs-core/ab-page-provider', 'AbScrollRegistrar')).toBe(false);
    expect(has('ab-nextjs-core/ab-page-provider', 'AB_REDUCED_MOTION_QUERY')).toBe(true);
    expect(has('ab-nextjs-core/ab-aside-layout', 'shouldCloseAbAsideOnSwipe')).toBe(true);
    expect(has('ab-nextjs-components/ab-nav-drawer', 'AbNavDrawerProps')).toBe(true);
    expect(has('ab-nextjs-components/ab-bottom-drawer', 'AbBottomDrawerProps')).toBe(true);
    expect(has('ab-nextjs-components/ab-toc', 'AbTocPromoProps')).toBe(true);
    expect(has('ab-nextjs-components/ab-toc-drawer', 'AbTocDrawerLink')).toBe(true);
    const inventory = buildInventory(extractCatalog(PROPS_CATALOG, root), root);
    for (const entry of PROPS_CATALOG) expect(has(entry.entry, entry.name), entry.id).toBe(true);
    for (const item of inventory.internal) expect(surface.some((row) => row.name === item.name)).toBe(false);
    const deferredKey = new Set(inventory.deferred.map((item) => `${item.entry}#${item.name}`));
    expect(deferredKey.has('ab-nextjs-components/ab-nav-drawer#AbNavDrawerProps')).toBe(true);
    expect(deferredKey.has('ab-nextjs-components/ab-bottom-drawer#AbBottomDrawerProps')).toBe(true);
    expect(deferredKey.has('ab-nextjs-components/ab-toc#AbTocPromoProps')).toBe(true);
    expect(deferredKey.has('ab-nextjs-components/ab-toc-drawer#AbTocDrawerLink')).toBe(true);
    expect(inventory.counts.publicExports).toBe(inventory.counts.covered + inventory.counts.deferred);
  });

  it('🪞 published server twins are aliases, and real optional, union and default kinds are named', () => {
    const byId = Object.fromEntries(extractCatalog(PROPS_CATALOG, process.cwd()).symbols.map((symbol) => [symbol.id, symbol]));
    const row = (id: string, name: string) => {
      const found = byId[id].rows?.find((item) => item.name === name);
      expect(found, `${id}.${name}`).toBeTruthy();
      return found!;
    };
    // 🪞 the server layout files declare the same members, so each is an alias of the client symbol
    for (const name of ['AbAppLayoutProps', 'AbMainLayoutProps', 'AbAsideLayoutProps'] as const) {
      expect(byId[`server.${name}`]).toMatchObject({ kind: 'alias', aliasOf: name, name });
    }
    // ✅ required vs optional on the published client interface
    expect(row('AbAppLayoutProps', 'orientation').required).toBe(true);
    expect(row('AbAppLayoutProps', 'orientation').type).toBe('"vertical" | "horizontal"');
    expect(row('AbAppLayoutProps', 'className').required).toBeUndefined();
    expect(row('AbAppLayoutProps', 'className').type).toBe('string | undefined');
    // 🧭 a published string-literal union, not a fixture
    expect(byId.AbDrawerSide).toMatchObject({ kind: 'union', type: "'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'" });
    // ⛔❓✅ the three default kinds on published declarations
    expect(row('AbDrawerProps', 'open').default).toEqual({ kind: 'none' });
    expect(row('AbDrawerProps', 'scope').default).toEqual({ kind: 'value', value: "'app'" });
    expect(row('AbAppLayoutProps', 'overlays').default).toEqual({ kind: 'unknown' });
    expect(row('UseAbScrollSpyOptions', 'rootMargin').required).toBeUndefined();
    expect(row('UseAbScrollSpyOptions', 'rootMargin').default).toEqual({ kind: 'unknown' });
    expect(row('UseAbScrollSpyOptions', 'root').default).toEqual({ kind: 'value', value: 'null' });
    expect(row('UseAbScrollSpyOptions', 'root').defaultSource).toBe('declared');
    expect(row('UseAbScrollSpyOptions', 'threshold').default).toEqual({ kind: 'value', value: '0' });
    expect(row('UseAbScrollSpyOptions', 'threshold').defaultSource).toBe('declared');
    // 📜 container and the deprecated root fall back to null in scrollToAbSection. That is not useAbScrollSpy's `root = null`.
    expect(row('ScrollToAbSectionOptions', 'container').default).toEqual({ kind: 'value', value: 'null' });
    expect(row('ScrollToAbSectionOptions', 'container').defaultSource).toBe('effective');
    expect(row('ScrollToAbSectionOptions', 'container').description).toMatch(/Not a declared initializer/);
    expect(row('ScrollToAbSectionOptions', 'root').defaultSource).toBe('effective');
    expect(row('ScrollToAbSectionOptions', 'root').default).toEqual({ kind: 'value', value: 'null' });
    expect(row('ScrollToAbSectionOptions', 'offset').defaultSource).toBe('declared');
  });

  it('🧬 a published interface keeps an inherited optional member', () => {
    // 📚 AbSidebarProps is not on a docs page. It is the published `extends` sample the catalog itself does not contain.
    const symbol = extractCatalog([{
      id: 'AbSidebarProps',
      name: 'AbSidebarProps',
      packageName: 'ab-nextjs-components',
      entry: 'ab-nextjs-components/ab-sidebar',
      file: 'node_modules/ab-nextjs-components/ab-sidebar/index.tsx',
      page: 'fixture',
    }], process.cwd()).symbols[0];
    const className = symbol.rows?.find((item) => item.name === 'className');
    const collapsible = symbol.rows?.find((item) => item.name === 'collapsible');
    expect(className?.required).toBeUndefined();
    expect(className?.description).toContain('Inherited from AbSidebarBaseProps.');
    expect(collapsible?.description ?? '').not.toContain('Inherited from');
  });

  it('🧬 a chain of interfaces keeps the grandbase, and a drifted server twin is not an alias', () => {
    const child = extractFixture(`
      interface One { id?: string }
      interface Two { label?: string }
      interface Both extends One, Two { ready: boolean }
      interface Child extends Both { extra?: number }
    `, 'Child');
    const names = (child.rows ?? []).map((row) => row.name);
    expect(names).toEqual(['extra', 'ready', 'id', 'label']);
    expect(child.rows?.find((row) => row.name === 'id')?.description).toContain('Inherited from One.');
    expect(child.rows?.find((row) => row.name === 'extra')?.required).toBeUndefined();
    expect(child.rows?.find((row) => row.name === 'ready')?.required).toBe(true);
    const same = { name: 'id', type: 'string', required: true, default: { kind: 'none' as const } };
    const drifted = markServerAliases([
      { id: 'Client', name: 'Props', packageName: 'fixture', entry: 'fixture/client', file: 'a', kind: 'props', description: '', rows: [same] },
      { id: 'server.Client', name: 'Props', packageName: 'fixture', entry: 'fixture/server', file: 'b', kind: 'props', description: '', rows: [{ ...same, type: 'number' }] },
    ]);
    expect(drifted[1].kind).toBe('props');
    expect(drifted[1].aliasOf).toBeUndefined();
  });

  it('🧲 a default on another function named options does not leak', () => {
    const symbol = extractFixture(`
      interface Target { root?: string }
      function other(options: { root?: number } = {}) {
        const { root = 1 } = options
      }
      function useTarget(options: Target = {}) {
        const picked = options.root ?? null
      }
    `, 'Target');
    const root = symbol.rows?.find((row) => row.name === 'root');
    expect(root?.default).toEqual({ kind: 'value', value: 'null' });
    expect(root?.defaultSource).toBe('effective');
  });

  it('🛡️ hostile table text stays inert, and none / unknown / value stay distinct', () => {
    const hostile = 'left | right | {not-a-column} `count` {/* mdx */} <PropsTable id="x" /> <script>alert(1)</script> <img src=x onerror="alert(1)">';
    const html = renderToStaticMarkup(
      <AbPropsTable
        caption="Hostile"
        label="Hostile props"
        rows={[
          { name: 'plain', type: 'string', description: 'untouched', default: { kind: 'none' } },
          { name: 'guess', type: 'string', description: 'not known', default: { kind: 'unknown' } },
          { name: 'on<Close>', type: hostile, description: hostile, default: { kind: 'value', value: hostile } },
        ]}
      />,
    );
    // 🧪 React text, not markdown: the characters survive, and none of them become tags
    const text = html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
    expect(text).toContain(hostile);
    expect(text).toContain('on<Close>');
    expect(html).not.toMatch(/<script|<img|<PropsTable/i);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('No default');
    expect(html).toContain('>unknown<');
    expect(html.match(/<th scope="col"/g)).toHaveLength(4);
    // 📋 the page component renders that same table for a real symbol, and an alias does not repeat it
    const pageHtml = renderToStaticMarkup(<DocsPropsTable id="AbDrawerProps" copyLabel="Copy code" copiedLabel="Copied" />);
    expect(pageHtml).toContain('data-ab-part="props-table"');
    expect(pageHtml).toContain('scope="col"');
    expect(pageHtml).toContain('tabindex="0"');
    expect(pageHtml).toContain('No default');
    expect(pageHtml).toContain('&#x27;app&#x27;');
    const aliasHtml = renderToStaticMarkup(<DocsPropsTable id="server.AbAppLayoutProps" copyLabel="Copy code" copiedLabel="Copied" />);
    expect(aliasHtml).toContain('data-props-alias="server.AbAppLayoutProps"');
    expect(aliasHtml).not.toContain('data-ab-part="props-table"');
  });

  it('🔁 a second process regenerates the same bytes, with no path or clock in the output', () => {
    const first = regenerate('a', { HOME: '/nowhere/props-a', TZ: 'UTC', PROPS_EXTRACT_STAMP: '111' });
    const second = regenerate('b', { HOME: '/nowhere/props-b', TZ: 'Pacific/Kiritimati', PROPS_EXTRACT_STAMP: '999', LANG: 'fr_FR.UTF-8' });
    expect([...second.keys()]).toEqual([...first.keys()]);
    for (const [name, body] of first) {
      expect(second.get(name)).toBe(body);
      expect(body).not.toContain(process.cwd());
      expect(body).not.toContain('/nowhere/props-');
      expect(body).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    }
    expect(first.get('generated.json')).toBe(readFileSync(join(process.cwd(), PROPS_JSON), 'utf8'));
    expect(first.get('inventory.json')).toBe(readFileSync(join(process.cwd(), INVENTORY_JSON), 'utf8'));
  }, 30_000);
});


// 📄 one child Node process writes the JSON, the inventory and the three pages into its own temp directory
const REGEN_PAGES = ['components/drawer', 'core/layouts', 'hooks/scroll-spy'] as const;

function regenerate(tag: string, env: Record<string, string>): Map<string, string> {
  const dir = mkdtempSync(join(tmpdir(), `props-${tag}-`));
  const out = join(dir, 'out');
  mkdirSync(out);
  const runner = join(dir, 'regen.mts');
  writeFileSync(runner, `
import { writeFileSync } from 'node:fs';
import { extractCatalog, PROPS_CATALOG, serializeProps, buildInventory, pagesMarkdown } from ${JSON.stringify(join(process.cwd(), 'scripts/extract-props.mts'))};
const doc = extractCatalog(PROPS_CATALOG, ${JSON.stringify(process.cwd())});
const out = ${JSON.stringify(out)};
writeFileSync(out + '/generated.json', serializeProps(doc));
writeFileSync(out + '/inventory.json', JSON.stringify(buildInventory(doc), null, 2) + '\\n');
for (const page of ${JSON.stringify(REGEN_PAGES)}) {
  writeFileSync(out + '/' + page.replaceAll('/', '__') + '.mdx', pagesMarkdown(page, doc));
}
`);
  const result = spawnSync(process.execPath, ['--experimental-strip-types', runner], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `regenerate ${tag} failed`);
  const names = ['generated.json', 'inventory.json', ...REGEN_PAGES.map((page) => `${page.replaceAll('/', '__')}.mdx`)];
  const files = new Map(names.map((name) => [name, readFileSync(join(out, name), 'utf8')]));
  rmSync(dir, { recursive: true, force: true });
  return files;
}
