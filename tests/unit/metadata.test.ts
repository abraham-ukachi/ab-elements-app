/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Metadata Tests
* @file: tests/unit/metadata.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> pnpm test
*
*/


import { describe, expect, it } from 'vitest';

import pkg from '@/package.json';
import enMessages from '@/messages/en.json';
import { APP_DESCRIPTION, APP_URL, StaticMetadata } from '@/app/metadata';


// smoke test: the root metadata loads and shares its copy with the en messages & package.json
describe('app/metadata', () => {
  it('exposes the abElements root metadata', () => {
    expect(StaticMetadata.applicationName).toBe('abElements');
    expect(StaticMetadata.metadataBase?.toString()).toBe(new URL(APP_URL).toString());
    // the title & description come from the `Metadata` messages (app/[locale]/layout.tsx)
    expect(StaticMetadata.title).toBeUndefined();
    expect(StaticMetadata.description).toBeUndefined();
  });

  it('takes its description from the en messages', () => {
    expect(APP_DESCRIPTION).toBe(enMessages.Metadata.description);
    expect(APP_DESCRIPTION).toBe(pkg.description);
    expect(enMessages.Metadata.titleTemplate).toBe('%s | abElements');
  });

  it('defaults to the production URL', () => {
    expect(APP_URL).toBe(process.env.NEXT_PUBLIC_APP_URL || 'https://ab-elements.vercel.app');
  });
});
