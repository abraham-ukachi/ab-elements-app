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
* @name: docs-mdx
* @file: components/app/docs-mdx/index.tsx
* @type: component
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <MDX components={getDocsMdxComponents({ copyLabel: 'Copy code', copiedLabel: 'Copied' })} />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧩 The docs MDX component map (0.2.24): what each MDX element renders. Packages only (PLAN.md "packages first"),
// so this file only WIRES package pieces to MDX names, it draws nothing itself 🚫🎨:
//   🔗 `a`        → the packaged AbLink (locale-aware, client-side navigation) for in-app paths
//   💻 `pre`      → AbCodeBlock (Shiki's pre-highlighted `<pre>` + the `title="…"` filename header + a copy button)
//   💡 `Callout`  → AbCallout (`<Callout type="note|tip|warning|danger" title="…">`, the theme's warning / danger colours)
//   🗂️ `Tabs/Tab` → AbContentTabs / AbContentTab (the WAI-ARIA tabs pattern, every panel in the server HTML)
//   🧪 `Example`  → 0.2.26 live previews: the packaged AbPreviewCode (components ≥ 0.6.0, G16): a Preview tab
//                   (its scoped AbDemoBox around the REAL package components) & a Code tab (AbDemoCode with the same
//                   source, Shiki-highlighted at build time; lib/remark-live-example keeps both from ONE source).
//                   No eval, no code strings turned into components, no iframe: a preview is compiled MDX 🛡️
//   📦 `AbButton`, `AbCallout`, `AbChip`, `AbKbd`, `AbPill` → the preview scope (LIVE_EXAMPLE_SCOPE)
// 📄 Long-form typography (headings, lists, tables, inline code) is the theme's `.ab-prose` class on the body wrapper.

// MDX types
import type { MDXComponents } from 'mdx/types';
// REACT types
import type { AnchorHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';
// import the child helpers (to split an Example's preview from its code) 🧩
import { Children, isValidElement, type ReactElement as El } from 'react';
// import the packaged, locale-aware link from `ab-nextjs-components` 🔗
import { AbLink } from 'ab-nextjs-components/ab-link';
// import the packaged code block (server, with its own client copy island) 💻
import AbCodeBlock from 'ab-nextjs-components/ab-code-block';
// import the packaged admonition (server-safe) 💡
import AbCallout, { type AbCalloutVariant } from 'ab-nextjs-components/ab-callout';
// import the packaged content tabs (client) 🗂️
import { AbContentTabs, AbContentTab } from 'ab-nextjs-components/ab-content-tabs';
// import the packaged Preview / Code pair (0.6.0, G16: AbContentTabs + a scoped AbDemoBox + AbDemoCode) 🧪💻
import AbPreviewCode from 'ab-nextjs-components/ab-preview-code';
// import the preview scope: published package components only (must match LIVE_EXAMPLE_SCOPE) 📦
import AbButton from 'ab-nextjs-components/ab-button';
import AbChip from 'ab-nextjs-components/ab-chip';
import AbKbd from 'ab-nextjs-components/ab-kbd';
import AbPill from 'ab-nextjs-components/ab-pill';
// import the build-time props table wiring (packaged AbPropsTable, 0.2.28) 📋
import { DocsPropsTable } from '@/components/app/docs-props';


// 🌍 the translated labels the map hands to the package pieces
export type DocsMdxLabels = Readonly<{
  copyLabel: string;
  copiedLabel: string;
  // 🧪 0.2.26 live previews: the tablist's name (when the Example has no title) & the two tab labels
  exampleLabel?: string;
  previewLabel?: string;
  codeLabel?: string;
  // 🧰 the preview toolbar (components ≥ 0.6.0): its name, the light/dark toggle & reload
  toolbarLabel?: string;
  darkLabel?: string;
  reloadLabel?: string;
}>;

// 🧪 the MDX `<Example title="…">` props (its children were split by the remark step: [ExamplePreview, pre])
type DocsExampleProps = Readonly<{ title?: string; code?: string; children?: ReactNode }>;

// 🧾 the props fumadocs' rehype-code leaves on a Shiki `<pre>` (`title="…"` from the fence meta)
type DocsPreProps = HTMLAttributes<HTMLPreElement> & { title?: string; 'data-language'?: string };

// 💡 the MDX `<Callout>` props (fumadocs-style `type`, mapped onto AbCallout's `variant`)
type DocsCalloutProps = Readonly<{ type?: AbCalloutVariant | 'info' | 'warn' | 'error'; title?: ReactNode; children?: ReactNode }>;


/**
 * `DocsAnchor` - an MDX link 🔗: in-app paths go through AbLink (locale prefix + client navigation), the rest
 * (external URLs, `#hash`, `mailto:`) stay plain anchors (external ones open safely in a new tab).
 *
 * @param { AnchorHTMLAttributes<HTMLAnchorElement> } props
 * @returns { ReactElement }
 */
function DocsAnchor({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>): ReactElement {
  // 🏠 an app path (not protocol-relative)
  if (href.startsWith('/') && !href.startsWith('//')) return <AbLink href={href} {...rest}>{children}</AbLink>;
  // 🌐 an external URL
  if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener" {...rest}>{children}</a>;
  // ⚓ a hash / mailto link
  return <a href={href} {...rest}>{children}</a>;
}


/**
 * `toCalloutVariant` - fumadocs' callout names → AbCallout's four kinds 🎨
 *
 * @param { DocsCalloutProps['type'] } type
 * @returns { AbCalloutVariant }
 */
export function toCalloutVariant(type: DocsCalloutProps['type']): AbCalloutVariant {
  // 🔁 the aliases (`info` = note, `warn` = warning, `error` = danger); unknown → note
  switch (type) {
    case 'tip': return 'tip';
    case 'warning': case 'warn': return 'warning';
    case 'danger': case 'error': return 'danger';
    default: return 'note';
  }
}


/**
 * `DocsPreBlock` - every fenced block 💻: Shiki's `<pre>` goes INSIDE AbCodeBlock untouched (its light-dark() spans
 * kept); the fence's `title="…"` becomes the filename header; the copy button copies the rendered text 📋
 *
 * @param { DocsPreProps & { labels?: DocsMdxLabels } } props
 * @returns { ReactElement }
 */
function DocsPreBlock({ title, 'data-language': language, labels, ...pre }: DocsPreProps & { labels: DocsMdxLabels }): ReactElement {
  return (
    <AbCodeBlock filename={title} language={language} copyLabel={labels.copyLabel} copiedLabel={labels.copiedLabel}>
      <pre {...pre} />
    </AbCodeBlock>
  );
}


/**
 * `findShikiPre` - the Shiki `<pre>` props inside an Example's code child (whatever MDX wrapped around it) 🔍
 *
 * @param { ReactNode } node
 * @param { unknown } preType - the map's `pre` component
 * @returns { DocsPreProps | null }
 */
function findShikiPre(node: ReactNode, preType: unknown): DocsPreProps | null {
  for (const c of Children.toArray(node)) {
    if (!isValidElement(c)) continue; // 🙅 text
    const props = c.props as DocsPreProps & { children?: ReactNode };
    if (c.type === preType || c.type === 'pre') return props; // ✅ the fence's <pre>
    const deeper = findShikiPre(props.children, preType); // 🔁
    if (deeper) return deeper;
  }
  return null;
}


/**
 * `DocsExamplePreview` - the marker the remark step wraps around an Example's real components 🏷️ (it renders
 * them as they are; DocsExample finds it by identity to tell the preview from the code)
 *
 * @param { { children?: ReactNode } } props
 * @returns { ReactElement }
 */
export function DocsExamplePreview({ children }: { children?: ReactNode }): ReactElement {
  return <>{children}</>;
}


/**
 * `getLivePreviewScope` - the package components an `<Example>` may render (the MDX names = the export names) 📦
 *
 * @returns { MDXComponents }
 */
export function getLivePreviewScope(): MDXComponents {
  return { AbButton, AbCallout, AbChip, AbKbd, AbPill } as MDXComponents;
}


/**
 * `DocsExample` - a live example 🧪: the packaged AbContentTabs (WAI-ARIA tabs, ←/→/Home/End, both panels in the
 * server HTML) with a Preview tab (the packaged AbDemoBox around the real components) & a Code tab (the Shiki
 * `<pre>` in AbCodeBlock, via the map's `pre`). Only package pieces: this function only wires them 🔌
 *
 * @param { DocsExampleProps & { labels: DocsMdxLabels } } props
 * @returns { ReactElement }
 */
function DocsExample({ title, code = '', children, labels, preType }: DocsExampleProps & { labels: DocsMdxLabels; preType: unknown }): ReactElement {
  // ✂️ [ExamplePreview, the Shiki code block] (anything else, e.g. whitespace, is dropped)
  const parts = Children.toArray(children).filter(isValidElement) as El<Record<string, unknown>>[];
  const preview = parts.find((p) => p.type === DocsExamplePreview);
  const fence = parts.find((p) => p.type !== DocsExamplePreview);
  // 🖍️ the fence's Shiki `<pre>` as a plain element (AbDemoCode draws the code frame, not the map's AbCodeBlock)
  const found = fence ? findShikiPre(fence, preType) : null;
  // ✂️ drop the header bits (AbDemoCode draws its own) & Shiki's tab stop (the wrapper is the stop)
  const { title: _t, 'data-language': _l, tabIndex: _ti, ...pre } = found ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    // 🏷️ `ab-prose-none`: the page's long-form typography stays out of the components under test
    <div data-docs-example="" className="ab-prose-none">
      <AbPreviewCode
        label={title ?? labels.exampleLabel ?? 'Example'} // ♿ names the tablist
        labels={{ preview: labels.previewLabel, code: labels.codeLabel, copy: labels.copyLabel, copied: labels.copiedLabel, toolbar: labels.toolbarLabel, dark: labels.darkLabel, reload: labels.reloadLabel }} // 🌍
        code={code} // 📋 the exact source (shown & copied only)
        // 🖍️ build-time Shiki via `highlighted` (never `trustedHtml`). ⌨️ components ≥ 0.6.0 make the code WRAPPER
        //    the one tab stop (arrow keys scroll long lines) & drop Shiki's own `tabindex`, so we pass none
        highlighted={found ? <pre {...pre} /> : undefined}
        // 🧰 the packaged toolbar (0.6.0): a per-preview light/dark toggle & reload. ↗️ No `href`: there is no
        //    standalone example page yet, and an open link is only given for a same-origin path that passes the
        //    URL allowlist (lib/remark-live-example `isSafeLiveUrl`), so it stays off for now
        toolbar
        language="tsx"
      >
        {preview /* 👀 the real components, rendered by React like the rest of the page */}
      </AbPreviewCode>
    </div>
  );
}


/**
 * `getDocsMdxComponents` - the component map handed to every compiled MDX page 🗺️
 *
 * @param { DocsMdxLabels } labels - the copy button's translated names
 * @param { MDXComponents } [overrides] - per-page overrides
 * @returns { MDXComponents }
 */
export function getDocsMdxComponents(labels: DocsMdxLabels, overrides: MDXComponents = {}): MDXComponents {
  // 💻 the code block of this map (DocsExample looks for it to unwrap the Shiki <pre>)
  const DocsPre = (props: DocsPreProps) => <DocsPreBlock {...props} labels={labels} />;
  return {
    // 🔗 links
    a: DocsAnchor,
    // 💻 every fenced block: Shiki's `<pre>` goes INSIDE AbCodeBlock untouched (its tabindex + light-dark() spans
    //    kept); the fence's `title="…"` becomes the filename header; the copy button copies the rendered text 📋
    pre: DocsPre,
    // 💡 `<Callout type="warning" title="…">…</Callout>`
    Callout: ({ type, title, children }: DocsCalloutProps) => <AbCallout variant={toCalloutVariant(type)} title={title}>{children}</AbCallout>,
    // 🗂️ `<Tabs label="…"><Tab label="pnpm">…</Tab></Tabs>`
    Tabs: AbContentTabs,
    Tab: AbContentTab,
    // 🧪 `<Example title="…">…package components…</Example>` (0.2.26 live previews) + its preview marker
    Example: (props: DocsExampleProps) => <DocsExample {...props} labels={labels} preType={DocsPre} />,
    ExamplePreview: DocsExamplePreview,
    // 📋 `<PropsTable id="AbDrawerProps" />` (rows come from the build-time JSON, rendered by AbPropsTable)
    PropsTable: ({ id }: { id?: string }) => <DocsPropsTable id={id ?? ''} copyLabel={labels.copyLabel} copiedLabel={labels.copiedLabel} />,
    // 📦 the preview scope (published package components only)
    ...getLivePreviewScope(),
    // 🧩 per-page overrides last
    ...overrides,
  };
}
