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
* @name: source.config
* @file: source.config.ts
* @type: config
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm exec fumadocs-mdx  # → .source/
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📚 The Fumadocs MDX config (0.2.24): ONE docs collection (`content/docs/<locale>/…`, PLAN.md §0.2.24), its
// frontmatter (fumadocs' title / description / icon + our package / kind / status, lib/docs) & the build-time
// Shiki highlighting 🖍️. `fumadocs-mdx` compiles it into `.source/` (see `collections/*` in tsconfig.json).

// import the collection & config helpers + fumadocs' base frontmatter / meta schemas 🧱
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config';
// import our extra frontmatter fields (relative: this file is bundled on its own, without the `@/` alias) 🧾
import { docsFrontmatterExtra } from './lib/docs-frontmatter';


// 📚 the docs collection: every `.mdx` page & `meta.json` under `content/docs`
export const docs = defineDocs({
  dir: 'content/docs',
  // 📄 the pages: fumadocs' fields + ours (an unknown `kind` / `status` fails the build ❌)
  docs: { schema: frontmatterSchema.extend(docsFrontmatterExtra.shape) },
  // 🗂️ the folders' order & titles
  meta: { schema: metaSchema },
});


// ⚙️ the MDX pipeline
export default defineConfig({
  mdxOptions: {
    // 🖍️ Shiki at build time (no highlighter shipped): one `light-dark()` colour per token, so the code follows the
    //    `color-scheme` without any app CSS 🌗 (theme ≥ 0.3.8 sets it on `.dark` / `.light`, so it follows the pick)
    rehypeCodeOptions: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light-dark()',
      // 🚫 no language icon on `<pre>` (fumadocs-ui's CodeBlock reads it; the packaged AbCodeBlock draws the header)
      icon: false,
    },
  },
});
