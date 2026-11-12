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
* @name: abElements Changelog Markdown
* @file: components/app/changelog-md/index.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <ChangelogMarkdown markdown={'## 0.1.0\n\n* Hello'} labels={{ copy: 'Copy', copied: 'Copied' }} />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📜 The changelog body (0.2.29): parsed blocks become React elements. There is no `dangerouslySetInnerHTML`
//    and no MDX. A `<script>` or `<img>` in the source is text, because the parser never emits an HTML node 🚫.

// REACT types
import type { ReactElement, ReactNode } from 'react';
// import the packaged link (locale-aware for site paths) 🔗
import { AbLink } from 'ab-nextjs-components/ab-link';
// import the packaged code block 💻
import AbCodeBlock from 'ab-nextjs-components/ab-code-block';
// import the block types 🧱
import { parseChangelogBlocks, type ChangelogBlock, type ChangelogInline } from '@/lib/changelog';


// 🌍 the copy button's words (the same Docs messages the MDX pages use)
export type ChangelogMarkdownLabels = Readonly<{ copy: string; copied: string }>;

// 🧾 props
type ChangelogMarkdownProps = Readonly<{ markdown: string; labels: ChangelogMarkdownLabels }>;


/**
 * `InlineRuns` - one list of inlines 🔤
 *
 * @param { { runs: ChangelogInline[] } } props
 * @returns { ReactElement }
 */
function InlineRuns({ runs }: { runs: readonly ChangelogInline[] }): ReactElement {
  // 🔤 each run is an element. Text is a string, so React escapes it.
  return (
    <>
      {runs.map((run, index) => {
        // 💻 inline code
        if (run.type === 'code') return <code key={index}>{run.text}</code>;
        // 💪 strong
        if (run.type === 'strong') return <strong key={index}><InlineRuns runs={run.children} /></strong>;
        // 🔤 emphasis
        if (run.type === 'em') return <em key={index}><InlineRuns runs={run.children} /></em>;
        // 🔗 a site path goes through AbLink; everything else is a plain anchor
        if (run.type === 'link') {
          const children = <InlineRuns runs={run.children} />; // 🔤
          if (run.href.startsWith('/') && !run.href.startsWith('//')) return <AbLink key={index} href={run.href}>{children}</AbLink>;
          // 🌐 external links open in a new tab; a hash stays on this page
          // 🌐 a new tab. `noreferrer` goes with `noopener` so the opened page cannot see this one.
          if (/^https?:\/\//i.test(run.href)) return <a key={index} href={run.href} target="_blank" rel="noopener noreferrer">{children}</a>;
          return <a key={index} href={run.href}>{children}</a>;
        }
        // 🔤 text, escaped by React
        return <span key={index}>{run.text}</span>;
      })}
    </>
  );
}


/**
 * `BlockView` - one block 🧱
 *
 * @param { { block: ChangelogBlock; labels: ChangelogMarkdownLabels } } props
 * @returns { ReactNode }
 */
function BlockView({ block, labels }: { block: ChangelogBlock; labels: ChangelogMarkdownLabels }): ReactNode {
  // 📰 a subsection under the version
  if (block.type === 'h') return <h4>{block.text}</h4>;
  // 💬 a quote
  if (block.type === 'quote') return <blockquote><p><InlineRuns runs={block.children} /></p></blockquote>;
  // 📋 a bullet list
  if (block.type === 'ul') return <ul>{block.items.map((item, index) => <li key={index}><InlineRuns runs={item} /></li>)}</ul>;
  // 🔢 a numbered list
  if (block.type === 'ol') return <ol>{block.items.map((item, index) => <li key={index}><InlineRuns runs={item} /></li>)}</ol>;
  // 💻 a fence, inside the packaged code block (the `<pre>` is ours; the markdown did not supply HTML)
  if (block.type === 'pre') {
    return (
      <AbCodeBlock language={block.lang || undefined} copyLabel={labels.copy} copiedLabel={labels.copied}>
        <pre><code>{block.code}</code></pre>
      </AbCodeBlock>
    );
  }
  // 📝 a paragraph
  return <p><InlineRuns runs={block.children} /></p>;
}


/**
 * `ChangelogMarkdown` - an entry body 📜
 *
 * @param { ChangelogMarkdownProps } props
 * @returns { ReactElement }
 */
export function ChangelogMarkdown({ markdown, labels }: ChangelogMarkdownProps): ReactElement {
  // 🧱 parse here (pure, no HTML nodes)
  const blocks = parseChangelogBlocks(markdown);
  // 📜 the blocks, in order
  return (
    <>
      {blocks.map((block, index) => <BlockView key={index} block={block} labels={labels} />)}
    </>
  );
}
