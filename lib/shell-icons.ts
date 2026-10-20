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
* @name: abElements Shell Icons
* @file: lib/shell-icons.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <AbIconRegistrar icons={SHELL_ICONS} /> // once, in the (docs) layout 🔣
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🔣 The client AbIcon only renders the icons the app registers (components 0.1.13): these are the ones the
// sidebar, bottom bar, app bar, aside toggle & cards use. Plain, serializable data (no side effect): the server
// `(docs)` layout hands it to the packaged `<AbIconRegistrar icons={SHELL_ICONS} />` 🗂️.
// Per-icon modules, so only these ship to the browser 🌳.

// import the svg data type from `ab-nextjs-components` 🧾
import type { AbIconSvgData } from 'ab-nextjs-components/ab-icon';

// import every shell icon from `ab-nextjs-icons` (0.2.4: outlined + filled) 🎨
import home from 'ab-nextjs-icons/ab-icons/icons/home';
import article from 'ab-nextjs-icons/ab-icons/icons/article';
import search from 'ab-nextjs-icons/ab-icons/icons/search';
import person from 'ab-nextjs-icons/ab-icons/icons/person';
import toc from 'ab-nextjs-icons/ab-icons/icons/toc';
import language from 'ab-nextjs-icons/ab-icons/icons/language';
import computer from 'ab-nextjs-icons/ab-icons/icons/computer';
import dashboardCustomize from 'ab-nextjs-icons/ab-icons/icons/dashboard_customize';
import widgets from 'ab-nextjs-icons/ab-icons/icons/widgets';
import palette from 'ab-nextjs-icons/ab-icons/icons/palette';
import interests from 'ab-nextjs-icons/ab-icons/icons/interests';
import matchCase from 'ab-nextjs-icons/ab-icons/icons/match_case';
import animation from 'ab-nextjs-icons/ab-icons/icons/animation';
import webhook from 'ab-nextjs-icons/ab-icons/icons/webhook';
import translate from 'ab-nextjs-icons/ab-icons/icons/translate';


// 📦 the AbIcons name of each package row / card 🗂️
export const PACKAGE_ICONS: Record<string, string> = {
  core: 'dashboard_customize', // 🧱
  components: 'widgets', // 🧩
  theme: 'palette', // 🎨
  icons: 'interests', // 🔣
  fonts: 'match_case', // 🔤
  animations: 'animation', // 🎞️
  hooks: 'webhook', // 🪝
  i18n: 'translate', // 🌍
};

// 🗂️ every icon to register, by AbIcons name (passed to AbIconRegistrar) 🔣
export const SHELL_ICONS: Record<string, AbIconSvgData> = {
  home, article, search, person, toc, language, computer, // 🧭 shell
  dashboard_customize: dashboardCustomize, widgets, palette, interests, match_case: matchCase, animation, webhook, translate, // 📦 packages
};
