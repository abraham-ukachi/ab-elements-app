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
* @name: docs-frontmatter
* @file: lib/docs-frontmatter.ts
* @type: lib
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { docsFrontmatterExtra } from '@/lib/docs-frontmatter';
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧾 The extra frontmatter fields of a docs page (0.2.24, PLAN.md §0.2.24), on top of fumadocs' title / description /
// icon. Its own file with zod as its only import: `source.config.ts` is bundled on its own (no `@/` alias) 📦.

// import zod (the frontmatter schema) 🧾
import { z } from 'zod';


// 🧾 our fields: the documented package, where its API runs & how mature it is
export const docsFrontmatterExtra = z.object({
  // 📦 the package the page documents (e.g. `ab-nextjs-core`)
  package: z.string().regex(/^ab-nextjs-[a-z0-9-]+$/).optional(),
  // 🖥️ where the documented API runs: a Client or a Server Component / module
  kind: z.enum(['client', 'server']).optional(),
  // 🚦 the maturity of the documented API
  status: z.enum(['new', 'beta', 'stable', 'deprecated']).optional(),
});

// 🧾 the type of those extra fields
export type DocsFrontmatterExtra = z.infer<typeof docsFrontmatterExtra>;
