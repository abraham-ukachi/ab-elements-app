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
* @name: abElements Package Previews
* @file: components/app/package-previews/index.tsx
* @type: Server Component
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <AbPackageCard preview={getPackagePreviews(labels).fonts} … />
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🖼️ The 8 tiny package previews of the Home cards (spec §4 "Previews"). AbPackageCard (components 0.1.14, P10)
// owns the 56 / 44px tile, radius and surface; the app only passes the CONTENT, which is page copy, not UI 🧩.
// Animations, Hooks, Core & Components use the PACKAGED previews (components 0.2.0: AbPackagePreviewCurve /
// AbPackagePreviewCode / AbPackagePreviewComponents); only Fonts, Icons, Theme & i18n are still app copy here.
// Everything is decorative (`aria-hidden`): the card's title + description carry the meaning ♿.

// REACT types
import type { ReactNode } from 'react';

// import the server AbIcon (no JS shipped) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
// import the packaged previews (0.2.0) 🧩
import { AbPackagePreviewCurve, AbPackagePreviewCode, AbPackagePreviewComponents } from 'ab-nextjs-components/ab-package-card';
// import the package ids 📦
import type { AbPackageId } from '@/lib/packages';

// 🔤 mono preview text (Roboto Mono via the theme's `--ab-font-code`)
const MONO = 'm-0 whitespace-pre font-(family-name:--ab-font-code) text-[11.5px] leading-[1.35] text-(--ab-color-muted)';
// 🎨 the Theme swatches (spec §4, the bronze ramp → bg → text)
const SWATCHES = ['#6B4F35', '#8B6340', '#A67C52', '#D9BFA3', '#FFF8F5', '#211A16'];

// 🧱 one centred, decorative row
const Row = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span aria-hidden="true" className={`flex h-full w-full items-center justify-center gap-2 ${className}`}>{children}</span>
);

// 🏷️ the translated words inside the Components tile (components 0.2.2 `labels`)
export type PackagePreviewLabels = Readonly<{ button: string; chip: string; switch: string }>;


/**
 * `getPackagePreviews` - id → preview node, with the Components tile's words translated 🗺️
 *
 * @param { PackagePreviewLabels } labels - "Button", "Chip" & "Switch" in the current locale
 * @returns { Record<AbPackageId, ReactNode> }
 */
export const getPackagePreviews = (labels: PackagePreviewLabels): Record<AbPackageId, ReactNode> => ({
  // 🔤 the three shipped families: Mulish 800 · Inter 400 · Roboto Mono (accent)
  fonts: (
    <Row className="gap-3 text-[24px] leading-none text-(--ab-color-text)">
      <span className="font-(family-name:--ab-font-title) font-extrabold">Aa</span>
      <span className="font-(family-name:--ab-font-body)">Aa</span>
      <span className="font-(family-name:--ab-font-code) text-[20px] text-(--ab-color-accent-text)">Aa</span>
    </Row>
  ),
  // 🔣 5 × 20px glyphs (home & bolt filled)
  icons: (
    <Row className="gap-3 text-(--ab-color-muted)">
      <AbIcon name="home" size={20} filled /><AbIcon name="search" size={20} /><AbIcon name="palette" size={20} />
      <AbIcon name="bolt" size={20} filled /><AbIcon name="person" size={20} />
    </Row>
  ),
  // 🎞️ the packaged ease-out curve + its name
  animations: <AbPackagePreviewCurve />,
  // 🎨 6 swatches, 20 × 28, radius 6
  theme: (
    <Row className="gap-[5px]">
      {SWATCHES.map((c) => <span key={c} className="h-7 w-5 rounded-[6px] border border-(--ab-color-border)" style={{ background: c }} />)}
    </Row>
  ),
  // 🪝 two hook calls (`*kw*` = an accent keyword)
  hooks: <AbPackagePreviewCode lines={['*use*Theme()', '*use*Media()']} />,
  // 🧱 the provider (`~` = a dim line)
  core: <AbPackagePreviewCode lines={['<*AbProvider*>', '~  {children}']} />,
  // 🧩 the packaged button, on switch & chip (translated, 0.2.2)
  components: <AbPackagePreviewComponents labels={labels} />,
  // 🌍 the 4 shipped locales as mono chips (Decision 1)
  i18n: (
    <Row className="gap-[5px]">
      {['EN', 'FR', 'ES', 'RU'].map((l) => <span key={l} className={`${MONO} rounded-[5px] bg-(--ab-color-tint) px-[5px] py-px text-[10.5px] font-semibold text-(--ab-color-accent-text)`}>{l}</span>)}
    </Row>
  ),
});
