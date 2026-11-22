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
* @name: abElements Search Hotkey
* @file: lib/search-hotkey.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> useAbHotkey(DOCS_SEARCH_HOTKEY, () => setOpen('search'), docsSearchHotkeyOptions)
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ⌨️ The docs shell's one search shortcut (hooks 0.1.9, D49).
//    `mod+k` is ⌘K on Apple and Ctrl+K everywhere else. The bar fields keep `hotkey={false}`
//    so they show no key cap and register no second listener. This module only names the combo
//    and the options; `DocsShell` is the one place that listens.

// import the published combo and the options type from `ab-nextjs-hooks` 🪝
import { AB_HOTKEY_SEARCH, type UseAbHotkeyOptions } from 'ab-nextjs-hooks/useAbHotkey';


// 🔎 the search combo, re-exported so the shell and the tests share one string (`'mod+k'`)
export const DOCS_SEARCH_HOTKEY = AB_HOTKEY_SEARCH;

// ✍️ explicit on purpose.
//    hooks 0.1.9 fires a `mod` / Ctrl / Meta / Alt combo inside an input, a textarea, a select,
//    `contenteditable` and `role="textbox"` by default, and stays silent there for a bare key
//    or Shift alone. The 404 field's older listener (components 0.7.1) already opened search
//    from anywhere, including a text field. `allowInInputs: true` keeps that choice written
//    down, so a later default cannot drop ⌘K / Ctrl+K while someone is typing.
//    A bare key is not bound here, so "/" and letters typed into a field stay characters. 🔤
export const docsSearchHotkeyOptions = {
  allowInInputs: true, // ✍️ fire while typing
} as const satisfies UseAbHotkeyOptions;
