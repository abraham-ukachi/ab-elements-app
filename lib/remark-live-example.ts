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
* @name: remarkLiveExample
* @file: lib/remark-live-example.ts
* @type: remark plugin (build time)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> remarkPlugins: [remarkLiveExample]  # source.config.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Live previews (0.2.26, PLAN.md F3 · D45): an MDX `<Example>` holds REAL package components as JSX children.
//    At BUILD time this remark plugin:
//      1️⃣ checks every child against a small allow-list (package components only, literal props only) 🛡️
//      2️⃣ slices the children's exact MDX source out of the file (no drift: the code IS the preview) ✂️
//      3️⃣ rewrites `<Example>` into `<ExamplePreview>{children}</ExamplePreview>` + a ```tsx fence, which the
//         normal Shiki rehype step then highlights (still at build time, no highlighter shipped) 🖍️
//    Nothing is evaluated at run time: no `eval`, no `new Function`, no code strings turned into components, no
//    sandbox iframe. A preview is plain compiled MDX/JSX, exactly like the rest of the page ✅.


// 🧩 the components a preview may use: ONLY published `ab-nextjs-components` pieces (wired in docs-mdx) 📦
export const LIVE_EXAMPLE_SCOPE: readonly string[] = ['AbButton', 'AbCallout', 'AbChip', 'AbKbd', 'AbPill'];

// 🧱 the tiny slice of mdast / mdx-jsx we touch (local types: no extra dependency for a few fields)
type LivePoint = Readonly<{ line?: number; column?: number; offset?: number }>;
type LiveEstree = Readonly<{ type: string; [key: string]: unknown }>;
type LiveAttr = { type: string; name?: string; value?: unknown };
export type LiveNode = {
  type: string;
  name?: string | null;
  value?: string;
  lang?: string | null;
  meta?: string | null;
  attributes?: LiveAttr[];
  children?: LiveNode[];
  position?: { start: LivePoint; end: LivePoint };
};
type LiveFile = { value?: unknown; path?: string };


/**
 * `isLiteralEstree` - is this attribute expression a plain literal? 🔢 (a string / number / boolean / null, a
 * negative number, or an array of those, e.g. `keys={['⌘', 'K']}`). Anything else (calls, identifiers,
 * functions, objects, templates…) is refused, so a preview can never run arbitrary code 🛡️
 *
 * @param { LiveEstree | undefined } node
 * @returns { boolean }
 */
export function isLiteralEstree(node: LiveEstree | undefined): boolean {
  if (!node) return false; // 🙅 nothing
  switch (node.type) {
    case 'Literal': return !('regex' in node && node.regex); // ✅ but no RegExp literal
    case 'UnaryExpression': return node.operator === '-' && isLiteralEstree(node.argument as LiveEstree); // ➖ -1
    case 'ArrayExpression': return (node.elements as LiveEstree[]).every((e) => isLiteralEstree(e)); // 📚
    default: return false; // 🚫
  }
}


/**
 * `checkLiveAttr` - one JSX attribute: a plain name with a string / boolean value or a literal expression 🏷️
 *
 * @param { LiveAttr } attr
 * @returns { string | null } an error message, or null when allowed
 */
function checkLiveAttr(attr: LiveAttr): string | null {
  if (attr.type !== 'mdxJsxAttribute') return 'spread props ({...x}) are not allowed'; // 🚫 {...props}
  if (!attr.name || /^on[A-Z]/.test(attr.name)) return `the "${attr.name}" prop is not allowed (no handlers)`; // 🚫 onClick={…}
  if (attr.name === 'dangerouslySetInnerHTML') return 'dangerouslySetInnerHTML is not allowed'; // 🚫 raw HTML
  const v = attr.value;
  if (v == null || typeof v === 'string') return null; // ✅ `disabled` / `label="Save"`
  // 🔍 `{…}`: fumadocs / mdx-js keep the parsed estree on `data.estree` → only a lone literal expression passes
  const program = (v as { data?: { estree?: { body?: Array<{ type: string; expression?: LiveEstree }> } } }).data?.estree;
  const body = program?.body ?? [];
  const ok = body.length === 1 && body[0].type === 'ExpressionStatement' && isLiteralEstree(body[0].expression);
  return ok ? null : `the "${attr.name}" prop must be a literal value`;
}


/**
 * `checkLiveNode` - walk a preview child: package components (the scope), text & paragraphs only 🛡️
 *
 * @param { LiveNode } node
 * @param { readonly string[] } scope
 * @returns { string | null } the first error, or null when the whole subtree is allowed
 */
export function checkLiveNode(node: LiveNode, scope: readonly string[] = LIVE_EXAMPLE_SCOPE): string | null {
  switch (node.type) {
    case 'text': return null; // ✍️ plain text
    case 'paragraph': break; // 📄 a line of inline content → check its children
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement': {
      if (!node.name || !scope.includes(node.name)) return `<${node.name ?? ''}> is not a package component in the preview scope`; // 🚫 html / fragments / app UI
      for (const attr of node.attributes ?? []) { const err = checkLiveAttr(attr); if (err) return err; } // 🏷️
      break;
    }
    default: return `${node.type} is not allowed in a live example`; // 🚫 {expressions}, import/export, markdown…
  }
  for (const child of node.children ?? []) { const err = checkLiveNode(child, scope); if (err) return err; } // 🔁
  return null;
}


/**
 * `dedent` - strip the common leading indentation (and blank edges) of a source slice ✂️
 *
 * @param { string } source
 * @returns { string }
 */
export function dedent(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift(); // 🧹 leading blank lines
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop(); // 🧹 trailing blank lines
  const indents = lines.filter((l) => l.trim()).map((l) => (/^[ \t]*/.exec(l) as RegExpExecArray)[0].length);
  const min = indents.length ? Math.min(...indents) : 0; // 📏
  return lines.map((l) => l.slice(min)).join('\n');
}


/**
 * `exampleSource` - the exact MDX source of an `<Example>`'s children (their offsets in the file) 📄
 *
 * @param { LiveNode[] } children
 * @param { string } file - the whole MDX text
 * @returns { string | null } the dedented source, or null without positions
 */
export function exampleSource(children: LiveNode[], file: string): string | null {
  const first = children[0]?.position?.start;
  const last = children[children.length - 1]?.position?.end;
  if (first?.offset == null || last?.offset == null) return null; // 🤷🏽‍♂️ no positions
  // ⬅️ keep the first line's own indentation, so every line dedents by the same amount
  const pad = ' '.repeat(Math.max(0, (first.column ?? 1) - 1));
  return dedent(pad + file.slice(first.offset, last.offset));
}


/**
 * `transformLiveExamples` - rewrite every `<Example>` of a tree in place (exported for the unit tests) 🔁
 *
 * @param { LiveNode } tree
 * @param { string } file - the MDX text the positions point into
 * @param { string } [path] - for the error message
 * @returns { number } how many examples were rewritten
 */
export function transformLiveExamples(tree: LiveNode, file: string, path = 'MDX'): number {
  let count = 0;
  const visit = (node: LiveNode): void => {
    if (node.type === 'mdxJsxFlowElement' && node.name === 'Example') {
      const children = (node.children ?? []).filter((c) => !(c.type === 'text' && !c.value?.trim())); // 🧹 blank text
      if (!children.length) throw new Error(`${path}: <Example> needs at least one package component inside`);
      for (const child of children) {
        const err = checkLiveNode(child);
        if (err) throw new Error(`${path}: <Example> ${err} (line ${child.position?.start.line ?? '?'})`); // ❌ fail the build
      }
      const code = exampleSource(children, file);
      if (code == null) throw new Error(`${path}: <Example> has no source positions`);
      // 📋 the raw source rides along as a string prop (AbPreviewCode's `code`: shown & copied, NEVER evaluated)
      node.attributes = [...(node.attributes ?? []).filter((a) => a.name !== 'code'), { type: 'mdxJsxAttribute', name: 'code', value: code }];
      // 🪄 [preview (the real children), the code fence (Shiki highlights it next)]
      node.children = [
        { type: 'mdxJsxFlowElement', name: 'ExamplePreview', attributes: [], children },
        { type: 'code', lang: 'tsx', meta: null, value: code },
      ];
      count++;
      return; // 🙅 no nested examples
    }
    for (const child of node.children ?? []) visit(child); // 🔁
  };
  visit(tree);
  return count;
}


/**
 * `remarkLiveExample` - the remark plugin (unified attacher) 🔌
 *
 * @returns { (tree: LiveNode, file: LiveFile) => void }
 */
export default function remarkLiveExample() {
  return (tree: LiveNode, file: LiveFile): void => {
    transformLiveExamples(tree, String(file.value ?? ''), file.path);
  };
}
