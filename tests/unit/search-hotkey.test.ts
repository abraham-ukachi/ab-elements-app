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
* @name: abElements Search Hotkey Tests
* @file: tests/unit/search-hotkey.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/search-hotkey.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// ⌨️ hooks 0.1.9: the shell binds `mod+k` and sets `allowInInputs: true` on purpose.
//    These tests use the published helpers (no DOM) so a flipped flag fails here, and the
//    e2e suite presses the real keys inside real fields.

// import the file reader 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the test helpers 🧪
import { describe, expect, it } from 'vitest';
// import the published decision helpers 🪝
import {
  allowsAbHotkeyInInputs,
  isAbEditableTarget,
  matchAbHotkey,
} from 'ab-nextjs-hooks/useAbHotkey';
// import the shell's combo and the explicit options ⌨️
import { DOCS_SEARCH_HOTKEY, docsSearchHotkeyOptions } from '@/lib/search-hotkey';


// 📖 a source file
const read = (path: string): string => readFileSync(join(process.cwd(), path), 'utf8');

// 🎹 a keyboard event with only the fields the matcher reads
type Key = { key: string; code: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean };

// 🧱 a tiny element: tag, input type, contenteditable, and an optional role
function element(tag: string, extra: { type?: string; editable?: boolean; role?: string } = {}): EventTarget {
  // 🏷️ the node the helper inspects
  const node = {
    tagName: tag, // 🏷️
    type: extra.type ?? 'text', // 🔤
    isContentEditable: extra.editable === true, // ✏️
    // 🔍 contenteditable ancestor, or role="textbox" on this node
    closest(selector: string) {
      if (extra.editable && selector.includes('contenteditable')) return node; // ✏️
      if (extra.role === 'textbox' && selector.includes('textbox')) return node; // ♿
      return null; // 🙅
    },
  };
  return node as unknown as EventTarget;
}

// 🔔 would the shell's combo call its handler for this key, on this target?
function fires(target: EventTarget | null, event: Key, platform: 'apple' | 'other'): boolean {
  // 🎹 every modifier is a real boolean (KeyboardEvent's fields are never undefined)
  const key = {
    key: event.key,
    code: event.code,
    ctrlKey: event.ctrlKey ?? false,
    metaKey: event.metaKey ?? false,
    altKey: event.altKey ?? false,
    shiftKey: event.shiftKey ?? false,
  };
  // 🎯 the combo itself (platform-strict, exact modifiers)
  if (!matchAbHotkey(key, DOCS_SEARCH_HOTKEY, platform)) return false;
  // ✍️ a text field needs the explicit flag; anything else always may fire
  if (isAbEditableTarget(target) && !allowsAbHotkeyInInputs(DOCS_SEARCH_HOTKEY, docsSearchHotkeyOptions.allowInInputs)) return false;
  return true; // 🔔
}

// ⌃K on Linux / Windows, ⌘K on Apple 🍎
const CTRL_K: Key = { key: 'k', code: 'KeyK', ctrlKey: true };
const META_K: Key = { key: 'k', code: 'KeyK', metaKey: true };
const CTRL_SHIFT_K: Key = { key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true };
const BARE_K: Key = { key: 'k', code: 'KeyK' };


describe('search hotkey options ⌨️', () => {
  it('states allowInInputs: true for the one shell combo', () => {
    // 🔎 the published search combo, not a hand-written string that could drift
    expect(DOCS_SEARCH_HOTKEY).toBe('mod+k');
    // ✍️ explicit. The default for a mod combo is also true; the flag is what the shell passes.
    expect(docsSearchHotkeyOptions.allowInInputs).toBe(true);
    expect(allowsAbHotkeyInInputs(DOCS_SEARCH_HOTKEY, docsSearchHotkeyOptions.allowInInputs)).toBe(true);
    // 🎯 an explicit false would silence it inside a field, which is the choice we did not make
    expect(allowsAbHotkeyInInputs(DOCS_SEARCH_HOTKEY, false)).toBe(false);
  });

  it('the shell listens once, and the bar fields do not', () => {
    const shell = read('components/app/docs-shell/index.tsx');
    // ⌨️ one call, with the shared options object (so the flag cannot be omitted at the call)
    expect(shell).toContain("useAbHotkey(DOCS_SEARCH_HOTKEY, () => setOpen('search'), docsSearchHotkeyOptions)");
    expect(shell.match(/useAbHotkey\(/g)).toHaveLength(1);
    // 🔎 three triggers, each with the listener off (no second listener, no key cap on the bars).
    //    The `>` inside `() =>` is why this is a line scan, not one `[^>]*` match.
    const quiet = shell.split('\n').filter((line) => line.includes('<AbSearchTrigger') && line.includes('hotkey={false}'));
    expect(quiet).toHaveLength(3);
  });

  it('the 404 field still shows its key cap', () => {
    // ⌨️ components 0.7.1 shows the cap only while that field listens. The shell option is the explicit one.
    const field = read('components/app/not-found/islands.tsx');
    expect(field).toContain('allowInInputs: true');
    expect(field).toContain('hotkey />');
  });
});


describe('shortcut inside a text field ✍️', () => {
  // 🔤 the fields hooks 0.1.9 treats as "the visitor is typing"
  const typing = [
    ['input', element('INPUT')],
    ['search', element('INPUT', { type: 'search' })],
    ['textarea', element('TEXTAREA')],
    ['select', element('SELECT')],
    ['contenteditable', element('DIV', { editable: true })],
    ['textbox', element('DIV', { role: 'textbox' })],
  ] as const;

  it.each(typing)('Ctrl+K opens search from a %s on a non-Apple keyboard', (_name, target) => {
    expect(isAbEditableTarget(target)).toBe(true); // ✍️
    expect(fires(target, CTRL_K, 'other')).toBe(true); // ⌃
  });

  it.each(typing)('⌘K opens search from a %s on Apple', (_name, target) => {
    expect(fires(target, META_K, 'apple')).toBe(true); // ⌘
  });

  it('a bare key, an extra Shift, and the other modifier stay characters', () => {
    const input = element('INPUT');
    // 🔤 "k" is typed, search stays closed
    expect(fires(input, BARE_K, 'other')).toBe(false);
    // ⇧ Ctrl+Shift+K is a different combo (modifiers match exactly)
    expect(fires(input, CTRL_SHIFT_K, 'other')).toBe(false);
    // 🍎 Ctrl+K on a Mac is not `mod+k` (⌘ is)
    expect(fires(input, CTRL_K, 'apple')).toBe(false);
    // 🪟 ⌘K on Windows / Linux is not `mod+k` (Ctrl is)
    expect(fires(input, META_K, 'other')).toBe(false);
  });

  it('a checkbox and the page itself still open search', () => {
    // ☑️ not a text field: the input rule does not apply, and the combo still matches
    const checkbox = element('INPUT', { type: 'checkbox' });
    expect(isAbEditableTarget(checkbox)).toBe(false);
    expect(fires(checkbox, CTRL_K, 'other')).toBe(true);
    // 🪟 the document is not an element
    expect(fires(null, CTRL_K, 'other')).toBe(true);
  });
});
