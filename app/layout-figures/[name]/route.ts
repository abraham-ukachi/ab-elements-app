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
* @name: layout figures
* @file: app/layout-figures/[name]/route.ts
* @type: route
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> GET /layout-figures/layout-anatomy-light.svg
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🖼️ Serves the layout-rule figures from `.github/layout/` (the only copy). No animation, title + desc live in the SVG.

// import the file reader 📁
import { readFileSync } from 'node:fs';
// import the path joiner 🧭
import { join } from 'node:path';


// 🖼️ the fourteen figures (light + dark). Anything else is a 404.
const FIGURES = [
  'layout-anatomy-light.svg',
  'layout-anatomy-dark.svg',
  'layout-scroll-regions-light.svg',
  'layout-scroll-regions-dark.svg',
  'layout-empty-chrome-light.svg',
  'layout-empty-chrome-dark.svg',
  'layout-drawer-scopes-light.svg',
  'layout-drawer-scopes-dark.svg',
  'layout-breakpoints-light.svg',
  'layout-breakpoints-dark.svg',
  'layout-scroll-spy-light.svg',
  'layout-scroll-spy-dark.svg',
  'layout-welcome-mapping-light.svg',
  'layout-welcome-mapping-dark.svg',
] as const;

// 🧾 the route params (Next.js 16: a Promise)
type FigureParams = Readonly<{ params: Promise<{ name: string }> }>;


/**
 * `GET` - one SVG 🖼️
 *
 * @param { Request } _request
 * @param { FigureParams } context
 * @returns { Response }
 */
export function GET(_request: Request, context: FigureParams): Promise<Response> {
  // 🧭 the file name, then the bytes
  return context.params.then(({ name }) => {
    // 🚫 not one of the fourteen (also rejects `..`)
    if (!FIGURES.includes(name as (typeof FIGURES)[number])) return new Response('Not found', { status: 404 });
    // 📖 the single copy under `.github/layout`
    const body = readFileSync(join(process.cwd(), '.github', 'layout', name));
    // 🖼️ SVG, cacheable (the file is content-addressed by the build)
    return new Response(body, {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=86400',
        'x-content-type-options': 'nosniff',
      },
    });
  });
}
