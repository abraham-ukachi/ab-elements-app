/*
* @license MIT
* ~~~~~~~~~~~~
* ab-elements-app
* ~~~~~~~~~~~~
* Copyright (c) 2024 Abraham Ukachi. The abElements Project.
*
* @project: ab-elements-app
* @name: abElements Web App Manifest Tests
* @file: tests/unit/manifest.test.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abraham.ukachi@laplateforme.io>
*
* Example usage:
*   1+|> pnpm test
*
*/


import { describe, expect, it } from 'vitest';

import manifest from '@/app/manifest';
import enMessages from '@/messages/en.json';


describe('app/manifest', () => {
  it('takes its lang, name & description from the default (en) messages', () => {
    const { lang, name, short_name, description } = manifest();

    expect(lang).toBe('en');
    expect(name).toBe('abElements');
    expect(short_name).toBe('abElements');
    expect(description).toBe(enMessages.Metadata.description);
  });
});
