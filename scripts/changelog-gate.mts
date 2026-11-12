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
* @name: changelog-gate
* @file: scripts/changelog-gate.mts
* @type: build script (server only, never imported by a client component)
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> node --experimental-strip-types scripts/changelog-gate.mts
*    -|> AB_CHANGELOG_GATE=warn node --experimental-strip-types scripts/changelog-gate.mts
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🚦 prebuild (0.2.29): fail when an installed ab-nextjs-* version has no released changelog entry.
//    `AB_CHANGELOG_GATE=warn` prints the same report and exits 0. Leave it unset in CI.

// import the gate 🚦
import { enforceChangelogGate } from '../lib/changelog.ts';


// 🚦 read the installed changelogs and throw unless the review flag is exactly `warn`
enforceChangelogGate();
