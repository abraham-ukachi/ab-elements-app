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
import { APP_DESCRIPTION, StaticMetadata } from '@/app/metadata';


// smoke test: the root metadata loads and shares its copy with package.json
describe('app/metadata', () => {
  it('exposes the abElements root metadata', () => {
    expect(StaticMetadata.applicationName).toBe('abElements');
    expect(StaticMetadata.title).toMatchObject({ template: '%s | abElements' });
    expect(StaticMetadata.description).toBe(APP_DESCRIPTION);
    expect(APP_DESCRIPTION).toBe(pkg.description);
  });
});
