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
* @name: abElements Release-Age Pin Tests
* @file: tests/unit/release-age-pins.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/release-age-pins
*    -|>
*
*/

/*
* 🛡️ D33 guard: every `minimumReleaseAgeExclude` pin in pnpm-workspace.yaml must
*    1. 📌 name ONE exact `name@version` (no ranges, no wildcards),
*    2. 🎯 match the version that is actually locked (no stale pins left behind),
*    3. ⏳ when marked `D33: expires YYYY-MM-DD HH:MM Paris`, still be in date.
*       Once a pin expires this test FAILS on purpose: the release is a day old,
*       so pnpm's normal release-age rule covers it and the pin should be deleted.
*/

import { readFileSync } from 'node:fs'; // 📂
import { join } from 'node:path'; // 🧭
import { describe, expect, it } from 'vitest'; // 🧪

// 📂 read a repo file as text
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

// 📌 one parsed pin: name, version and its optional expiry
type Pin = { name: string; version: string; expires?: Date; raw: string };

// 🔍 pull the pins out of the `minimumReleaseAgeExclude:` list
function readPins(): Pin[] {
  const lines = read('pnpm-workspace.yaml').split('\n');
  const start = lines.findIndex((l) => l.startsWith('minimumReleaseAgeExclude:'));
  const pins: Pin[] = [];
  for (const line of lines.slice(start + 1)) {
    const m = /^\s+-\s+'?([^'#\s]+)'?\s*(?:#\s*(.*))?$/.exec(line);
    if (!m) break; // 🛑 end of the list
    const [, spec, comment = ''] = m;
    const at = spec.lastIndexOf('@');
    const exp = /D33: expires (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) Paris/.exec(comment);
    pins.push({
      name: spec.slice(0, at),
      version: spec.slice(at + 1),
      // 🕰️ Paris is UTC+2 until the 25 Oct 2026 DST switch, UTC+1 after
      expires: exp ? new Date(`${exp[1]}T${exp[2]}:00${exp[1] < '2026-10-25' ? '+02:00' : '+01:00'}`) : undefined,
      raw: line.trim(),
    });
  }
  return pins;
}

const pins = readPins();
const lock = read('pnpm-lock.yaml');

describe('🛡️ D33 minimumReleaseAgeExclude pins', () => {
  it('📋 has pins to check', () => {
    expect(pins.length).toBeGreaterThan(0);
  });

  it.each(pins.map((p) => [p.raw, p] as const))('📌 %s is one exact version', (_raw, pin) => {
    expect(pin.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it.each(pins.map((p) => [p.raw, p] as const))('🎯 %s is the locked version', (_raw, pin) => {
    expect(lock).toContain(`\n  ${pin.name}@${pin.version}:`);
  });

  it.each(pins.filter((p) => p.expires).map((p) => [p.raw, p] as const))(
    '⏳ %s has not expired yet (delete it once it has)',
    (_raw, pin) => {
      expect(Number.isNaN(pin.expires!.getTime())).toBe(false);
      expect(pin.expires!.getTime()).toBeGreaterThan(Date.now());
    },
  );
});
