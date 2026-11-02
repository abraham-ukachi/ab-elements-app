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
*   1+|> <MDX components={getDocsMdxComponents()} />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧩 The docs MDX component map (0.2.24): what each MDX element renders. Packages only (PLAN.md "packages first"):
// internal links → the packaged AbLink (locale-aware, client-side navigation). Everything else stays the plain HTML
// the MDX compiler emits (headings with ids, lists, tables, Shiki's `<pre>`), styled by the theme's base layer.
// 🕳️ Package gaps (listed for the packages, NOT built here): AbCodeBlock (Shiki HTML + copy button), AbCallout,
//    content tabs (AbTabs is a nav bar without tab panels) & a prose wrapper (theme typography for MDX).

// MDX types
import type { MDXComponents } from 'mdx/types';
// REACT types
import type { AnchorHTMLAttributes, ReactElement } from 'react';
// import the packaged, locale-aware link from `ab-nextjs-components` 🔗
import { AbLink } from 'ab-nextjs-components/ab-link';


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
 * `getDocsMdxComponents` - the component map handed to every compiled MDX page 🗺️
 *
 * @param { MDXComponents } [overrides] - per-page overrides
 * @returns { MDXComponents }
 */
export function getDocsMdxComponents(overrides: MDXComponents = {}): MDXComponents {
  // return the map (links only for now, see the gaps above) 🧩
  return { a: DocsAnchor, ...overrides };
}
