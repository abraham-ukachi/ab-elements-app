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
* @name: check-no-eval
* @file: scripts/check-no-eval.mjs
* @type: Node.js script
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm build && pnpm check:no-eval
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🛡️ CSP-friendly client bundle (0.2.26 live previews, D45): the browser JavaScript Next.js ships
//    (`.next/static/**/*.js`) must never call `eval(…)` or `new Function(…)`, so the site keeps working under a
//    `script-src` WITHOUT 'unsafe-eval' (next.config.ts only adds it in dev). Live previews are compiled MDX, so they
//    add nothing here. Exits 1 (and lists each hit) on a match, 0 otherwise ✅. `NEXT_DIST=…` to scan another build.

// import the file helpers 📁
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';


// 📁 the client bundle
const ROOT = join(process.env.NEXT_DIST || '.next', 'static');
// 🚫 the dynamic-code patterns (a property such as `x.eval` or a word such as `evaluate(` is not a call to eval)
const PATTERNS = [
  { id: 'eval', re: /(?<![\w$.])eval\s*\(/g },
  { id: 'new Function', re: /\bnew\s+Function\s*\(/g },
];


/**
 * `walk` 🚶🏽 - every `.js` file under a folder
 *
 * @param { string } dir
 * @returns { Promise<string[]> }
 */
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path))); // 🔁
    else if (entry.name.endsWith('.js')) out.push(path); // 📄
  }
  return out;
}


// 🔍 scan
let files;
try {
  files = await walk(ROOT);
} catch {
  console.error(`❌ no client bundle at ${ROOT}: run \`pnpm build\` first`);
  process.exit(1);
}
const hits = [];
for (const file of files) {
  const js = await readFile(file, 'utf8');
  for (const { id, re } of PATTERNS) {
    for (const m of js.matchAll(re)) hits.push(`${file}: ${id} → …${js.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}…`);
  }
}

// 🧾 the verdict
if (hits.length) {
  console.error(`❌ ${hits.length} dynamic-code call(s) in the client bundle:\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log(`✅ no eval / new Function in ${files.length} client bundle file(s)`);
