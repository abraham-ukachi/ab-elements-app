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
// 📄 Long-form typography (headings, lists, tables, inline code) is the theme's `.ab-prose` class on the body wrapper.

// MDX types
import type { MDXComponents } from 'mdx/types';
// REACT types
import type { AnchorHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';
// import the packaged, locale-aware link from `ab-nextjs-components` 🔗
import { AbLink } from 'ab-nextjs-components/ab-link';
// import the packaged code block (server, with its own client copy island) 💻
import AbCodeBlock from 'ab-nextjs-components/ab-code-block';
// import the packaged admonition (server-safe) 💡
import AbCallout, { type AbCalloutVariant } from 'ab-nextjs-components/ab-callout';
// import the packaged content tabs (client) 🗂️
import { AbContentTabs, AbContentTab } from 'ab-nextjs-components/ab-content-tabs';


// 🌍 the translated labels the map hands to the package pieces
export type DocsMdxLabels = Readonly<{ copyLabel: string; copiedLabel: string }>;

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
 * `getDocsMdxComponents` - the component map handed to every compiled MDX page 🗺️
 *
 * @param { DocsMdxLabels } labels - the copy button's translated names
 * @param { MDXComponents } [overrides] - per-page overrides
 * @returns { MDXComponents }
 */
export function getDocsMdxComponents(labels: DocsMdxLabels, overrides: MDXComponents = {}): MDXComponents {
  return {
    // 🔗 links
    a: DocsAnchor,
    // 💻 every fenced block: Shiki's `<pre>` goes INSIDE AbCodeBlock untouched (its tabindex + light-dark() spans
    //    kept); the fence's `title="…"` becomes the filename header; the copy button copies the rendered text 📋
    pre: ({ title, 'data-language': language, ...pre }: DocsPreProps) => (
      <AbCodeBlock filename={title} language={language} copyLabel={labels.copyLabel} copiedLabel={labels.copiedLabel}>
        <pre {...pre} />
      </AbCodeBlock>
    ),
    // 💡 `<Callout type="warning" title="…">…</Callout>`
    Callout: ({ type, title, children }: DocsCalloutProps) => <AbCallout variant={toCalloutVariant(type)} title={title}>{children}</AbCallout>,
    // 🗂️ `<Tabs label="…"><Tab label="pnpm">…</Tab></Tabs>`
    Tabs: AbContentTabs,
    Tab: AbContentTab,
    // 🧩 per-page overrides last
    ...overrides,
  };
}
