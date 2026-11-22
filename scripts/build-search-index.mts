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
* @name: build-search-index
* @file: scripts/build-search-index.mts
* @type: build script (server only, never imported by a client component)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> node --experimental-strip-types scripts/build-search-index.mts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🏗️ prebuild (0.2.30): write one zbsearch snapshot per locale to data/search/.
//    The gate runs next and refuses a file that is missing, invalid, or over 150 KB gzip.

// import the writer 🔎
import { writeSearchSnapshots } from '../lib/search-index.ts';


// 📊 build every locale and print the sizes (raw and gzip) plus the row counts
const reports = writeSearchSnapshots();

// 🚶 one line per locale, then the fallback pages
for (const report of reports) {
  // 📏 bytes, in KB with one decimal, so the log is easy to read
  const rawKb = (report.rawBytes / 1024).toFixed(1);
  const gzipKb = (report.gzipBytes / 1024).toFixed(1);
  // 🏷️ `page=17 section=…`
  const counts = Object.entries(report.counts).map(([kind, count]) => `${kind}=${count}`).join(' ');
  // 📊
  console.log(`search-index: ${report.locale} ${rawKb} KB raw, ${gzipKb} KB gzip (${report.rawBytes} / ${report.gzipBytes} bytes) ${counts}`);
  // 🏳️ pages still served from English
  console.log(`search-index: ${report.locale} fallback ${report.fallbackPages.join(' ') || '(none)'}`);
}
