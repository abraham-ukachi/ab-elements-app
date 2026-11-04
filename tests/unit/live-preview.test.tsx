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
* @name: Live previews (unit)
* @file: tests/unit/live-preview.test.tsx
* @type: Vitest
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm vitest run tests/unit/live-preview.test.tsx
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 Live previews (0.2.26): the build-time `<Example>` step (allow-list, exact source, no run-time code), the
//    MDX map's Example (packaged AbContentTabs · AbDemoBox · AbCodeBlock), the compiled Components page (both
//    panels in the HTML, the code = the preview) & the tab labels in all 4 locales 🌍

// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the server renderer (both tab panels are in the server HTML) 🖨️
import { renderToStaticMarkup } from 'react-dom/server';
// import the remark step & its helpers 🔌
import remarkLiveExample, { checkLiveNode, isSafeLiveUrl, dedent, exampleSource, isLiteralEstree, LIVE_EXAMPLE_SCOPE, transformLiveExamples, type LiveNode } from '@/lib/remark-live-example';
// import the docs MDX map & its preview scope 🗺️
import { DocsExamplePreview, getDocsMdxComponents, getLivePreviewScope } from '@/components/app/docs-mdx';
// import the docs source (the compiled MDX pages) 📚
import { source } from '@/lib/source';
// import the 4 locales' messages 🌍
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import ru from '@/messages/ru.json';


// 🏷️ the labels the page hands to the map
const LABELS = { copyLabel: 'Copy code', copiedLabel: 'Copied', exampleLabel: 'Example', previewLabel: 'Preview', codeLabel: 'Code' };

// 🧱 a JSX element node with positions (what remark-mdx produces) in a one-line file
function el(name: string, start: number, end: number, attributes: LiveNode['attributes'] = [], children: LiveNode[] = []): LiveNode {
  return { type: 'mdxJsxFlowElement', name, attributes, children, position: { start: { line: 2, column: 3, offset: start }, end: { line: 2, column: 3 + end - start, offset: end } } };
}

// 🔤 the HTML → text helper (entities back, tags gone)
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');


describe('live example step (build time) 🔌', () => {
  it('🪄 splits <Example> into the real children + a tsx fence of their exact source', () => {
    const file = '<Example>\n  <AbButton label="Save" />\n</Example>\n';
    const start = file.indexOf('<AbButton'); const end = start + '<AbButton label="Save" />'.length;
    const button = el('AbButton', start, end, [{ type: 'mdxJsxAttribute', name: 'label', value: 'Save' }]);
    const tree: LiveNode = { type: 'root', children: [{ type: 'mdxJsxFlowElement', name: 'Example', attributes: [], children: [button] }] };
    expect(transformLiveExamples(tree, file)).toBe(1);
    const [preview, code] = tree.children![0].children!;
    // 👀 the preview keeps the ORIGINAL node (not a copy, not a string)
    expect(preview).toMatchObject({ type: 'mdxJsxFlowElement', name: 'ExamplePreview' });
    expect(preview.children![0]).toBe(button);
    // 💻 the code is that node's source, verbatim
    expect(code).toEqual({ type: 'code', lang: 'tsx', meta: null, value: '<AbButton label="Save" />' });
    // 📋 …and the same string rides on <Example code="…"> (AbPreviewCode's `code`, one source for both)
    expect(tree.children![0].attributes).toContainEqual({ type: 'mdxJsxAttribute', name: 'code', value: '<AbButton label="Save" />' });
  });

  it('🔌 is a unified attacher reading file.value', () => {
    const file = '<Example>\n  <AbKbd />\n</Example>';
    const start = file.indexOf('<AbKbd');
    const tree: LiveNode = { type: 'root', children: [{ type: 'mdxJsxFlowElement', name: 'Example', children: [el('AbKbd', start, start + 9)] }] };
    remarkLiveExample()(tree, { value: file, path: 'x.mdx' });
    expect(tree.children![0].children![1].value).toBe('<AbKbd />');
  });

  it('✂️ dedents a multi-line slice by its common indentation', () => {
    expect(dedent('\n    <A>\n      b\n    </A>\n')).toBe('<A>\n  b\n</A>');
    const file = 'x\n  <AbPill>\n    v1\n  </AbPill>';
    const start = file.indexOf('<AbPill');
    expect(exampleSource([el('AbPill', start, file.length)], file)).toBe('<AbPill>\n  v1\n</AbPill>');
  });

  it('🛡️ allows package components, text & literal props only', () => {
    expect(checkLiveNode(el('AbButton', 0, 1, [{ type: 'mdxJsxAttribute', name: 'disabled', value: null }]))).toBeNull();
    // 🚫 not in the scope: raw HTML, app components, fragments
    expect(checkLiveNode(el('div', 0, 1))).toMatch(/not a package component/);
    expect(checkLiveNode(el('script', 0, 1))).toMatch(/not a package component/);
    expect(checkLiveNode({ type: 'mdxJsxFlowElement', name: null, children: [] })).toMatch(/not a package component/);
    // 🚫 handlers, raw HTML & spreads
    expect(checkLiveNode(el('AbButton', 0, 1, [{ type: 'mdxJsxAttribute', name: 'onClick', value: { type: 'mdxJsxAttributeValueExpression', value: 'alert(1)' } }]))).toMatch(/no handlers/);
    expect(checkLiveNode(el('AbButton', 0, 1, [{ type: 'mdxJsxAttribute', name: 'dangerouslySetInnerHTML', value: 'x' }]))).toMatch(/dangerouslySetInnerHTML/);
    expect(checkLiveNode(el('AbButton', 0, 1, [{ type: 'mdxJsxExpressionAttribute', value: '...props' }]))).toMatch(/spread/);
    // 🚫 {expressions} & import / export
    expect(checkLiveNode({ type: 'mdxFlowExpression', value: 'fetch("/x")' })).toMatch(/not allowed/);
    expect(checkLiveNode({ type: 'mdxjsEsm', value: 'import x from "y"' })).toMatch(/not allowed/);
    // 🚫 nested bad children are found too
    expect(checkLiveNode(el('AbCallout', 0, 1, [], [el('iframe', 0, 1)]))).toMatch(/iframe/);
  });

  it('🔗 URL props: /path, #hash, https: & mailto: only', () => {
    const link = (name: string, value: unknown) => el('AbButton', 0, 1, [{ type: 'mdxJsxAttribute', name, value }]);
    for (const ok of ['/docs', '/docs/installation#x', '#top', 'https://example.com', 'HTTPS://x.dev', 'mailto:hi@example.com']) {
      expect(isSafeLiveUrl(ok), ok).toBe(true);
      expect(checkLiveNode(link('href', ok)), ok).toBeNull();
    }
    for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,<script>', 'http://example.com', '//evil.example', 'vbscript:x', 'ftp://x', 'docs', '/\\evil.example', 'java\tscript:x', '']) {
      expect(isSafeLiveUrl(bad), bad).toBe(false);
      expect(checkLiveNode(link('href', bad)), bad).toMatch(/not allowed/);
    }
    // 🔗 every URL prop is checked (src, action, case-insensitive), and an expression URL is refused
    expect(checkLiveNode(link('src', 'data:image/png;base64,x'))).toMatch(/not allowed/);
    expect(checkLiveNode(link('formAction', 'javascript:x'))).toMatch(/not allowed/);
    expect(checkLiveNode(link('href', { type: 'mdxJsxAttributeValueExpression', data: { estree: { body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 'javascript:x' } }] } } }))).toMatch(/plain URL string/);
    // ❌ and it fails the build with the reason
    const file = '<AbButton href="javascript:x" />';
    expect(() => transformLiveExamples({ type: 'root', children: [{ type: 'mdxJsxFlowElement', name: 'Example', children: [link('href', 'javascript:x')] }] }, file, 'x.mdx')).toThrow(/x\.mdx: <Example> the "href" URL "javascript:x" is not allowed/);
  });

  it('🔢 a `{…}` prop must be a literal (estree)', () => {
    const lit = (v: unknown) => ({ type: 'Literal', value: v });
    expect(isLiteralEstree(lit('a'))).toBe(true);
    expect(isLiteralEstree({ type: 'ArrayExpression', elements: [lit('Ctrl'), lit('K')] })).toBe(true);
    expect(isLiteralEstree({ type: 'UnaryExpression', operator: '-', argument: lit(1) })).toBe(true);
    expect(isLiteralEstree({ type: 'CallExpression' })).toBe(false);
    expect(isLiteralEstree({ type: 'Identifier', name: 'window' })).toBe(false);
    expect(isLiteralEstree({ type: 'ArrowFunctionExpression' })).toBe(false);
    expect(isLiteralEstree({ type: 'Literal', value: null, regex: { pattern: 'x' } })).toBe(false);
    const attr = (expression: unknown) => ({ type: 'mdxJsxAttribute', name: 'keys', value: { type: 'mdxJsxAttributeValueExpression', data: { estree: { body: [{ type: 'ExpressionStatement', expression }] } } } });
    expect(checkLiveNode(el('AbKbd', 0, 1, [attr({ type: 'ArrayExpression', elements: [lit('K')] })]))).toBeNull();
    expect(checkLiveNode(el('AbKbd', 0, 1, [attr({ type: 'CallExpression' })]))).toMatch(/literal/);
  });

  it('❌ fails the build on an empty or unsafe <Example>', () => {
    expect(() => transformLiveExamples({ type: 'root', children: [{ type: 'mdxJsxFlowElement', name: 'Example', children: [] }] }, '')).toThrow(/at least one/);
    expect(() => transformLiveExamples({ type: 'root', children: [{ type: 'mdxJsxFlowElement', name: 'Example', children: [el('div', 0, 5)] }] }, '<div/>')).toThrow(/not a package component/);
  });
});


describe('preview scope & MDX map 🗺️', () => {
  it('📦 the map renders exactly the allow-listed package components', () => {
    expect(Object.keys(getLivePreviewScope()).sort()).toEqual([...LIVE_EXAMPLE_SCOPE].sort());
    const map = getDocsMdxComponents(LABELS);
    for (const name of [...LIVE_EXAMPLE_SCOPE, 'Example', 'ExamplePreview']) expect(['function', 'object'], name).toContain(typeof map[name as keyof typeof map]); // 🧩 a component (forwardRef = object)
    expect(map.ExamplePreview).toBe(DocsExamplePreview);
  });
});


describe('the Components page (compiled MDX) 📚', () => {
  const page = source.getPage(['packages', 'components'], 'en');
  const MDX = page!.data.body;
  const html = renderToStaticMarkup(<MDX components={getDocsMdxComponents(LABELS)} />);
  const examples = html.split('data-docs-example=""').slice(1);

  it('🧪 has live examples, each a Preview / Code tablist with BOTH panels in the HTML', () => {
    expect(examples.length).toBeGreaterThanOrEqual(4);
    for (const ex of examples) {
      expect(ex).toContain('role="tablist"');
      expect(ex).toContain('data-ab-part="preview-code"'); // 🧪💻 the packaged AbPreviewCode (0.6.0, G16)
      expect([...ex.matchAll(/role="tab"[^>]*>([^<]*)</g)].map((m) => m[1]).slice(0, 2)).toEqual(['Preview', 'Code']);
      // 👀 the Preview panel is open (not hidden) & holds the AbDemoBox; 💻 the Code panel is in the HTML, hidden
      const panels = ex.split('role="tabpanel"').slice(1, 3);
      expect(panels[0]).not.toMatch(/^[^>]*hidden=""/);
      expect(panels[0]).toContain('AbDemoBox');
      expect(panels[1]).toMatch(/^[^>]*hidden=""/);
      expect(panels[1]).toContain('AbCodeBlock');
      // 🖍️ highlighted at build time (Shiki's light-dark() tokens), never a run-time highlighter
      expect(panels[1]).toContain('class="shiki');
      // ⌨️ the panel is the one tab stop: Shiki's <pre> is not a second one; 🧾 no raw-HTML code path
      expect(panels[1]).toMatch(/<pre class="shiki[^>]*tabindex="-1"/);
      expect(panels[1]).not.toMatch(/<pre[^>]*tabindex="0"/);
    }
  });

  it('🪞 the code matches the preview (every label & text in the code is rendered in the preview)', () => {
    for (const ex of examples) {
      const [preview, code] = ex.split('role="tabpanel"').slice(1, 3);
      const src = text(code.slice(code.indexOf('<pre'), code.indexOf('</pre>')));
      expect(src).toMatch(/^<Ab[A-Z]/); // 💻 JSX of package components
      const previewText = text(preview);
      const strings = [...src.matchAll(/(?:label|title)="([^"]+)"/g), ...src.matchAll(/>\s*([^<>{}\s][^<>{}]*?)\s*</g), ...src.matchAll(/'([^']+)'/g)].map((m) => m[1]);
      expect(strings.length).toBeGreaterThan(0);
      for (const s of strings) expect(previewText, s).toContain(s);
      // 🧩 one rendered component per tag in the code (AbButton → AbButton class …)
      for (const tag of new Set([...src.matchAll(/<(Ab[A-Za-z]+)/g)].map((m) => m[1]))) expect(preview, tag).toContain(`${tag}`);
    }
  });

  it('🛡️ no raw HTML, scripts or iframes inside a preview', () => {
    for (const ex of examples) {
      const preview = ex.split('role="tabpanel"')[1];
      expect(preview).not.toMatch(/<script|<iframe|<object|<embed|javascript:/i);
    }
  });
});


describe('tab labels in all 4 locales 🌍', () => {
  it('🏷️ every locale names the example, the Preview & the Code tab', () => {
    const all = { en, fr, es, ru } as const;
    for (const [locale, m] of Object.entries(all)) {
      const ex = (m as typeof en).Docs.example;
      for (const key of ['label', 'preview', 'code'] as const) expect(ex[key], `${locale}.${key}`).toMatch(/\S/);
    }
    expect(fr.Docs.example.preview).toBe('Aperçu');
    expect(es.Docs.example.preview).toBe('Vista previa');
    expect(ru.Docs.example.preview).toBe('Превью');
  });
});
