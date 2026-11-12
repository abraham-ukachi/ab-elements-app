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

// import the file reader 📁
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// import the element helper (the HTTPS link is a rendered anchor) 🧩
import { createElement } from 'react';
// import the static renderer 🖨️
import { renderToStaticMarkup } from 'react-dom/server';
// import the test helpers 🧪
import { afterEach, describe, expect, it } from 'vitest';
// import the changelog body (external links get target and rel) 📜
import { ChangelogMarkdown } from '@/components/app/changelog-md';
// import the parser and the gate 📜
import {
  AB_CHANGELOG_GATE,
  CHANGELOG_GITMOJI,
  auditChangelogs,
  changelogGateMode,
  classifyHeading,
  enforceChangelogGate,
  loadChangelogs,
  parseChangelog,
  whatsNewItems,
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

  it('rejects a DEL and a NEL in a destination', () => {
    // 🚫 U+007F and U+0085 are controls, in a path, a fragment, a mailto, and an https URL
    expect(linkHrefs(`[go](/docs/${'\u007f'})`)).toEqual([]);
    expect(linkHrefs(`[go](#x${'\u0085'})`)).toEqual([]);
    expect(linkHrefs(`[go](mailto:a@b.c${'\u007f'})`)).toEqual([]);
    expect(linkHrefs(`[go](https://example.com/${'\u0085'})`)).toEqual([]);
  });

  it('drops an unsafe compare URL', () => {
    // 🚫 javascript: is not a changelog href, so the heading keeps the version and loses the link
    expect(classifyHeading('[1.2.3](javascript:x) (2026-11-12)')).toMatchObject({ kind: 'version', version: '1.2.3', compareUrl: null });
    // 🚫 a DEL in an otherwise https URL fails the same gate
    expect(classifyHeading(`[1.2.3](https://example.com/${'\u007f'}) (2026-11-12)`)).toMatchObject({ compareUrl: null });
    // ✅ a real compare link is kept
    expect(classifyHeading('[1.2.3](https://example.com/compare) (2026-11-12)')).toMatchObject({ compareUrl: 'https://example.com/compare' });
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


// 😀 the text runs of one inline parse (code spans are listed separately)
const inlineParts = (source: string): { text: string; code: string[] } => {
  const code: string[] = [];
  const walk = (runs: readonly ChangelogInline[]): string => runs.map((run) => {
    if (run.type === 'text') return run.text;
    if (run.type === 'code') { code.push(run.text); return ''; }
    return walk(run.children);
  }).join('');
  return { text: walk(parseChangelogInlines(source)), code };
};

// 😀 `:name:` tokens outside fenced blocks and inline code
const shortcodesOutsideCode = (markdown: string): string[] => {
  const stripped = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...stripped.matchAll(/:([a-z][a-z0-9_+-]*):/g)].map((match) => match[1] ?? '');
};


describe('gitmoji shortcodes 😀', () => {
  it('maps an allow-listed shortcode to its emoji', () => {
    // 📝 ✨ the two the page was showing as raw text
    expect(inlineParts(':memo: Write the guides').text).toBe(`${CHANGELOG_GITMOJI.memo} Write the guides`);
    expect(inlineParts('then :sparkles: add a page').text).toBe(`then ${CHANGELOG_GITMOJI.sparkles} add a page`);
    expect(CHANGELOG_GITMOJI.memo).toBe('📝');
    expect(CHANGELOG_GITMOJI.sparkles).toBe('✨');
    // 😀 a name with underscores is one token, not an italic span
    expect(inlineParts(':white_check_mark: done').text).toBe(`${CHANGELOG_GITMOJI.white_check_mark} done`);
  });

  it('leaves an unknown shortcode as literal text', () => {
    // 🚫 not in the table, and a timestamp's `:40:` is not a shortcode
    expect(inlineParts('see :not_a_gitmoji: later').text).toBe('see :not_a_gitmoji: later');
    expect(inlineParts('expires 2026-10-21T20:40:07Z').text).toBe('expires 2026-10-21T20:40:07Z');
  });

  it('does not map a shortcode inside a code span', () => {
    // 💻 the backticks win
    const parts = inlineParts('keep `:memo:` and map :memo:');
    expect(parts.code).toEqual([':memo:']);
    expect(parts.text).toBe(`keep  and map ${CHANGELOG_GITMOJI.memo}`);
  });

  it('parses underscore slugs before emphasis, so :white_check_mark: is not italic check', () => {
    // 😀 every allow-listed name that contains an underscore (the emphasis marker)
    const slugs = Object.keys(CHANGELOG_GITMOJI).filter((name) => name.includes('_'));
    expect(slugs).toContain('white_check_mark');
    expect(slugs).toEqual(expect.arrayContaining(['arrow_up', 'building_construction', 'chart_with_upwards_trend', 'globe_with_meridians', 'heavy_plus_sign']));
    for (const name of slugs) {
      // 🚫 no italic run, and the whole slug is the emoji
      const runs = parseChangelogInlines(`:${name}:`);
      expect(runs, name).toEqual([{ type: 'text', text: CHANGELOG_GITMOJI[name] }]);
    }
    // 🔤 emphasis still wraps a real word, including one that sits beside a slug
    expect(parseChangelogInlines('_check_')).toEqual([{ type: 'em', children: [{ type: 'text', text: 'check' }] }]);
    expect(parseChangelogInlines('a *star* and **bold** and __also__')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'em', children: [{ type: 'text', text: 'star' }] },
      { type: 'text', text: ' and ' },
      { type: 'strong', children: [{ type: 'text', text: 'bold' }] },
      { type: 'text', text: ' and ' },
      { type: 'strong', children: [{ type: 'text', text: 'also' }] },
    ]);
    // 😀 a slug between emphasis markers stays one token inside the emphasis (text runs merge)
    const wrapped = parseChangelogInlines('_see :white_check_mark: now_');
    expect(wrapped).toEqual([{ type: 'em', children: [{ type: 'text', text: `see ${CHANGELOG_GITMOJI.white_check_mark} now` }] }]);
    // 🚫 an unknown underscore slug stays literal text, not italic
    expect(parseChangelogInlines(':not_a_slug:')).toEqual([{ type: 'text', text: ':not_a_slug:' }]);
  });

  it('leaves :constructor:, :__proto__:, :toString: and :hasOwnProperty: as literal text', () => {
    // 🚫 these names live on Object.prototype. The table must not read them.
    for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
      const token = `:${name}:`;
      // 📰 the heading path (expandGitmojiText)
      expect(parseChangelogBlocks(`### ${token}`)[0], name).toMatchObject({ type: 'h', text: token });
      // 🔤 the inline path
      expect(parseChangelogInlines(token), name).toEqual([{ type: 'text', text: token }]);
    }
  });

  it('does not map a shortcode inside a code block', () => {
    // 💻 the fence is a pre, not an inline
    const blocks = parseChangelogBlocks('```\n:sparkles: stays\n```\n\n:sparkles: maps');
    expect(blocks[0]).toMatchObject({ type: 'pre', code: ':sparkles: stays' });
    expect(blocks[1]).toMatchObject({ type: 'p', children: [{ type: 'text', text: `${CHANGELOG_GITMOJI.sparkles} maps` }] });
  });

  it('covers every shortcode used outside code in the app and installed changelogs', () => {
    // 📁 this app, then each installed package
    const files = ['CHANGELOG.md', ...[
      'fonts', 'icons', 'animations', 'theme', 'hooks', 'core', 'components', 'i18n',
    ].map((id) => join('node_modules', `ab-nextjs-${id}`, 'CHANGELOG.md'))];
    // 😀 every `:name:` that is not inside a fence or a code span
    const used = new Set(files.flatMap((file) => shortcodesOutsideCode(readFileSync(join(process.cwd(), file), 'utf8'))));
    // ✅ the table has each of them, and the source files still contain the shortcode (we did not rewrite them)
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) expect(CHANGELOG_GITMOJI, name).toHaveProperty(name);
    expect(readFileSync(join(process.cwd(), 'CHANGELOG.md'), 'utf8')).toContain(':memo:');
  });
});


// 🔤 the characters of an inline run (the same reading order as the What's new title)
const plainInline = (runs: readonly ChangelogInline[]): string => runs.map((run) => (
  run.type === 'text' || run.type === 'code' ? run.text : plainInline(run.children)
)).join('');


describe('changelog external anchors 🔒', () => {
  it('gives an HTTPS:// link a new tab and noreferrer', () => {
    // 🌐 the scheme is uppercase. It is still an external link.
    const html = renderToStaticMarkup(createElement(ChangelogMarkdown, {
      markdown: '[site](HTTPS://example.com/a)',
      labels: { copy: 'Copy', copied: 'Copied' },
    }));
    expect(html).toContain('href="HTTPS://example.com/a"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});


describe('What\'s new rows 📰', () => {
  it('takes the title and the date from the latest released entry', () => {
    // 📚 the files the build reads
    const docs = loadChangelogs();
    // 📰 the three Home rows
    const items = whatsNewItems(docs, ['core', 'hooks', 'components']);
    expect(items.map((item) => item.id)).toEqual(['core', 'hooks', 'components']);
    // 📅 each row is that package's newest released heading, not a date typed into the page
    for (const item of items) {
      const doc = docs.find((entry) => entry.id === item.id);
      const entry = doc?.entries.find((candidate) => candidate.kind === 'version' && candidate.version);
      expect(entry, item.id).toBeTruthy();
      if (!entry) continue;
      const blocks = parseChangelogBlocks(entry.body);
      const list = blocks.find((block) => block.type === 'ul' || block.type === 'ol');
      expect(list && (list.type === 'ul' || list.type === 'ol'), item.id).toBeTruthy();
      if (list && (list.type === 'ul' || list.type === 'ol')) {
        expect(item.title, item.id).toBe(plainInline(list.items[0] ?? []).replace(/\s+/g, ' ').trim());
      }
      expect(item.date, item.id).toBe(entry.date);
      expect(item.version, item.id).toBe(entry.version);
      expect(item.href, item.id).toBe(`/changelog#${entry.anchor}`);
      expect(item.date, item.id).not.toMatch(/oct/i);
    }
  });

  it('does not keep an October 2026 date in the Home copy', () => {
    // 📄 the page reads the helper, not a message
    const page = readFileSync(join(process.cwd(), 'app/[locale]/(docs)/page.tsx'), 'utf8');
    expect(page).toContain('whatsNewItems');
    expect(page).not.toContain('whatsNew.items');
    // 🌍 none of the four message files still carries the old month
    for (const locale of ['en', 'fr', 'es', 'ru']) {
      const messages = readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8');
      expect(messages, locale).not.toMatch(/[Oo]ct\.?\s*2026|окт\.\s*2026/);
    }
  });
});
