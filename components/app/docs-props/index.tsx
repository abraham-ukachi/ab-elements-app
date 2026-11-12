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
* @name: docs-props
* @file: components/app/docs-props/index.tsx
* @type: component
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <DocsPropsTable id="AbDrawerProps" copyLabel="Copy code" copiedLabel="Copied" />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 📋 The docs wiring for a build-time props symbol (0.2.28). This file only chooses a row set from the
//    generated JSON and hands it to the packaged AbPropsTable. It does not draw a table of its own, and it
//    does not import the extractor (that stays in scripts/, out of the client bundle).

// REACT types
import type { ReactElement } from 'react';
// import the packaged props table (server component, components 0.7.0) 📋
import AbPropsTable, { type AbPropsTableRow } from 'ab-nextjs-components/ab-props-table';
// import the packaged code block for a signature or a constant (not a second table) 💻
import AbCodeBlock from 'ab-nextjs-components/ab-code-block';
// import the generated JSON (build-time data, no types are read here) 📄
import generated from '@/data/props/generated.json';

// 🧾 the slice of the JSON this component reads
type PropsSymbol = {
  id: string;
  name: string;
  entry: string;
  kind: string;
  signature?: string;
  type?: string;
  value?: string;
  aliasOf?: string;
  note?: string;
  rows?: AbPropsTableRow[];
};

// 📄 the committed document
const SYMBOLS = (generated as { symbols: PropsSymbol[] }).symbols;

// ⚙️ MDX `<PropsTable id="…" />`
type DocsPropsTableProps = {
  id: string;
  copyLabel: string;
  copiedLabel: string;
};


/**
 * `DocsPropsTable` - one extracted symbol 📋
 *
 * A props interface becomes AbPropsTable. A function or a constant also shows its signature in AbCodeBlock.
 * An alias (the server layout twin) names the client symbol instead of repeating the table.
 *
 * @param { DocsPropsTableProps } props
 * @returns { ReactElement }
 */
export function DocsPropsTable({ id, copyLabel, copiedLabel }: DocsPropsTableProps): ReactElement {
  // 🔎 the build failed closed if a page names a symbol the extractor did not emit
  const symbol = SYMBOLS.find((item) => item.id === id);
  if (!symbol) throw new Error(`DocsPropsTable: unknown symbol "${id}"`);
  // 🪞 server twins that match the client declaration
  if (symbol.kind === 'alias' && symbol.aliasOf) {
    return <p data-props-alias={symbol.id}><code>{symbol.entry}</code> is the server entry. It declares the same members as <code>{symbol.aliasOf}</code> on the client entry.</p>;
  }
  // 💻 signature, union, or printed constant (React escapes the text)
  const code = [symbol.signature, symbol.type, symbol.value].filter(Boolean).join('\n');
  return (
    <div data-props-symbol={symbol.id}>
      {code ? (
        <AbCodeBlock language="ts" copyLabel={copyLabel} copiedLabel={copiedLabel}>
          <pre><code>{code}</code></pre>
        </AbCodeBlock>
      ) : null}
      {symbol.rows && symbol.rows.length > 0 ? (
        <AbPropsTable caption={`${symbol.name}`} label={`${symbol.name} from ${symbol.entry}`} rows={symbol.rows} />
      ) : null}
    </div>
  );
}
