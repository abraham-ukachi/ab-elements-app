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
* @name: abElements Changelog tests
* @file: tests/unit/changelog.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> pnpm test tests/unit/changelog.test.ts
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🧪 The changelog parser (## and ###), the HTML-as-text rule, and the strict gate against today's packages.

// import the test helpers 🧪
import { afterEach, describe, expect, it } from 'vitest';
// import the parser and the gate 📜
import {
  AB_CHANGELOG_GATE,
  auditChangelogs,
  changelogGateMode,
  classifyHeading,
  enforceChangelogGate,
  loadChangelogs,
  parseChangelog,
  parseChangelogBlocks,
  parseChangelogInlines,
  type ChangelogInline,
} from '@/lib/changelog';


// 🚦 put the flag back after a test that changes it
const saved = process.env[AB_CHANGELOG_GATE];
afterEach(() => {
  if (saved === undefined) delete process.env[AB_CHANGELOG_GATE]; // 🧹
  else process.env[AB_CHANGELOG_GATE] = saved; // 🔁
});


describe('classifyHeading 🏷️', () => {
  it('reads a standard-version ## heading and a plain ### heading', () => {
    // 🔗 the components shape
    expect(classifyHeading('[0.7.0](https://example.com/compare) (2026-11-06)')).toMatchObject({ kind: 'version', version: '0.7.0', date: '2026-11-06' });
    // 🔢 the hooks shape
    expect(classifyHeading('0.1.7 (2026-10-16)')).toMatchObject({ kind: 'version', version: '0.1.7', date: '2026-10-16' });
  });

  it('marks Unreleased, with or without a version', () => {
    // 🚧 a version that was never cut
    expect(classifyHeading('0.3.7 (Unreleased)')).toMatchObject({ kind: 'unreleased', version: '0.3.7' });
    // 🚧 a bare Unreleased heading
    expect(classifyHeading('Unreleased (fix/review)')).toMatchObject({ kind: 'unreleased', version: null });
  });

  it('leaves a subsection heading alone', () => {
    // 📎 not a version
    expect(classifyHeading('Changes').kind).toBe('section');
  });
});


describe('parseChangelog 📜', () => {
  it('keeps both ## and ### version headings, and subsections inside the entry', () => {
    // 📜 a file that mixes the two heading levels
    const { entries } = parseChangelog([
      '# Changelog',
      '## [1.0.0](https://example.com/c) (2026-01-01)',
      '* first',
      '### Changes',
      '* still the same entry',
      '### 1.1.0 (2026-02-01)',
      '* second',
    ].join('\n'), 'demo');
    // 2️⃣ two versions, not three
    expect(entries.map((entry) => entry.version)).toEqual(['1.0.0', '1.1.0']);
    expect(entries[0]?.level).toBe(2);
    expect(entries[1]?.level).toBe(3);
    // ⚓ stable ids
    expect(entries.map((entry) => entry.anchor)).toEqual(['demo-1.0.0', 'demo-1.1.0']);
    // 📎 the subsection stayed in the first body
    expect(entries[0]?.body).toContain('### Changes');
    expect(entries[0]?.body).toContain('still the same entry');
  });

  it('flags a version that is not a ## or ### version heading', () => {
    // ⚠️ an h1 and a prose heading
    const { entries, malformed } = parseChangelog('# 2.0.0 (2026-03-01)\n\n### Released 2.0.0 today\n', 'demo');
    expect(entries).toEqual([]);
    expect(malformed.map((heading) => heading.level)).toEqual([1, 3]);
    expect(malformed.every((heading) => heading.versions.includes('2.0.0'))).toBe(true);
  });
});


describe('plain markdown 🚫', () => {
  it('keeps raw HTML as text', () => {
    // 🚫 a script and an image, the two things a changelog must not become
    const blocks = parseChangelogBlocks('<script>alert(1)</script>\n\n* <img src="x" onerror="alert(1)">');
    const text = JSON.stringify(blocks);
    // 🔤 the tags survive as text (JSON escaping does not turn them into elements)
    expect(text).toContain('<script>alert(1)</script>');
    expect(text).toContain('<img src=\\"x\\" onerror=\\"alert(1)\\">');
    expect(blocks.some((block) => block.type === 'p' || block.type === 'ul')).toBe(true);
    // 🔗 javascript: is not a link
    const runs = parseChangelogInlines('[click](javascript:alert(1))');
    expect(runs.some((run) => run.type === 'link')).toBe(false);
  });
});


/**
 * `linkHrefs` - every href the inline parser actually kept 🔗
 *
 * @param { string } source
 * @returns { string[] }
 */
function linkHrefs(source: string): string[] {
  // 🔗 the destinations
  const found: string[] = [];
  // 🚶 links can sit inside emphasis
  const walk = (runs: readonly ChangelogInline[]): void => {
    for (const run of runs) {
      if (run.type === 'link') found.push(run.href); // 🔗
      if (run.type === 'em' || run.type === 'strong' || run.type === 'link') walk(run.children); // 🔁
    }
  };
  walk(parseChangelogInlines(source));
  // 🔗 the list
  return found;
}


describe('changelog link safety 🔒', () => {
  it('rejects /\\evil.com as plain text', () => {
    // 🚫 a slash then a backslash is not a site path
    expect(linkHrefs('[go](/\\evil.com)')).toEqual([]);
  });

  it('rejects /\\/evil.com as plain text', () => {
    // 🚫 a backslash before the host
    expect(linkHrefs('[go](/\\/evil.com)')).toEqual([]);
  });

  it('rejects a site path with a tab before javascript: as plain text', () => {
    // 🚫 `/` + TAB + `javascript:x` must not become an anchor
    expect(linkHrefs(`[go](/${'\t'}javascript:x)`)).toEqual([]);
  });

  it('rejects a fragment with a hidden host, a backslash, or a tab', () => {
    // 🚫 the same three shapes, after `#`
    expect(linkHrefs('[go](#/\\evil.com)')).toEqual([]);
    expect(linkHrefs('[go](#/\\/evil.com)')).toEqual([]);
    expect(linkHrefs(`[go](#/${'\t'}javascript:x)`)).toEqual([]);
  });

  it('rejects a mailto with a hidden host, a backslash, or a tab', () => {
    // 🚫 the same three shapes, after `mailto:`
    expect(linkHrefs('[go](mailto:/\\evil.com)')).toEqual([]);
    expect(linkHrefs('[go](mailto:/\\/evil.com)')).toEqual([]);
    expect(linkHrefs(`[go](mailto:/${'\t'}javascript:x)`)).toEqual([]);
  });

  it('keeps a site path, a fragment, a mailto, and an https URL', () => {
    // ✅ the four destinations the page is allowed to link
    expect(linkHrefs('[docs](/docs/guides/layout-rule)')).toEqual(['/docs/guides/layout-rule']);
    expect(linkHrefs('[here](#components-0.7.0)')).toEqual(['#components-0.7.0']);
    expect(linkHrefs('[mail](mailto:abrahamukachi@gmail.com)')).toEqual(['mailto:abrahamukachi@gmail.com']);
    expect(linkHrefs('[gh](https://github.com/abraham-ukachi/ab-elements-app)')).toEqual(['https://github.com/abraham-ukachi/ab-elements-app']);
  });

  it('keeps a markdown URL that contains balanced parentheses', () => {
    // ✅ the `)` inside the URL is not the end of the link
    expect(linkHrefs('[wiki](https://example.com/Foo_(bar))')).toEqual(['https://example.com/Foo_(bar)']);
  });
});


describe('installed packages 🚦', () => {
  it('accepts the app and every installed package version', () => {
    // 📚 today's node_modules, after the 2026-11-12 changelog releases
    const audit = auditChangelogs(loadChangelogs());
    // ✅ nothing missing, Unreleased, or badly headed
    expect(audit.failures).toEqual([]);
    expect(audit.passed.map((item) => `${item.name}@${item.version}`)).toEqual([
      'ab-elements-app@0.2.28',
      'ab-nextjs-fonts@0.2.8',
      'ab-nextjs-icons@0.2.8',
      'ab-nextjs-animations@0.2.6',
      'ab-nextjs-theme@0.3.10',
      'ab-nextjs-hooks@0.1.8',
      'ab-nextjs-core@0.2.4',
      'ab-nextjs-components@0.7.1',
      'ab-nextjs-i18n@0.1.0',
    ]);
  });

  it('stays strict unless AB_CHANGELOG_GATE is exactly warn', () => {
    // 🚨 strict is the default, and these releases have entries, so it does not throw
    delete process.env[AB_CHANGELOG_GATE];
    expect(changelogGateMode()).toBe('strict');
    expect(enforceChangelogGate().failures).toEqual([]);
    // 🟡 warn is the review switch, and it still does not throw when nothing fails
    process.env[AB_CHANGELOG_GATE] = 'warn';
    expect(changelogGateMode()).toBe('warn');
    expect(enforceChangelogGate().failures).toEqual([]);
    // 🚫 a near miss stays strict
    process.env[AB_CHANGELOG_GATE] = 'WARN';
    expect(changelogGateMode()).toBe('strict');
  });
});
