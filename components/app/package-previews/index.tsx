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
*   1+|> <AbPackageCard preview={PACKAGE_PREVIEWS.fonts} … />
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
// Everything is decorative (`aria-hidden`): the card's title + description carry the meaning ♿.

// REACT types
import type { ReactNode } from 'react';

// import the server AbIcon (no JS shipped) 🔣
import AbIcon from 'ab-nextjs-components/server/ab-icon';
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

// 🗺️ id → preview node
export const PACKAGE_PREVIEWS: Record<AbPackageId, ReactNode> = {
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
  // 🎞️ an ease-out curve (120 × 44, stroke 2.2) + its name
  animations: (
    <Row className="gap-1">
      <svg width="96" height="40" viewBox="0 0 120 44" fill="none">
        <path d="M4 40 C 34 6, 70 4, 116 4" stroke="var(--ab-color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className={`${MONO} text-[9.5px]`}>ease-out</span>
    </Row>
  ),
  // 🎨 6 swatches, 20 × 28, radius 6
  theme: (
    <Row className="gap-[5px]">
      {SWATCHES.map((c) => <span key={c} className="h-7 w-5 rounded-[6px] border border-(--ab-color-border)" style={{ background: c }} />)}
    </Row>
  ),
  // 🪝 two hook calls
  hooks: <Row className={`${MONO} flex-col gap-0.5`}><span>useTheme()</span><span>useMedia()</span></Row>,
  // 🧱 the provider
  core: <Row className={`${MONO} flex-col gap-0.5`}><span>{'<AbProvider>'}</span><span>{'  {children}'}</span></Row>,
  // 🧩 a button chip, a switch & a chip
  components: (
    <Row className="gap-2 text-[11px] font-semibold">
      <span className="flex h-[22px] items-center rounded-[6px] bg-(--ab-color-btn) px-2 text-(--ab-color-btn-text)">Button</span>
      <span className="relative h-[17px] w-[30px] rounded-full bg-(--ab-color-accent)"><span className="absolute top-[2px] right-[2px] size-[13px] rounded-full bg-white" /></span>
      <span className="flex h-[22px] items-center rounded-[6px] bg-(--ab-color-tint) px-2 text-(--ab-color-accent-text)">Chip</span>
    </Row>
  ),
  // 🌍 the 4 shipped locales as mono chips (Decision 1)
  i18n: (
    <Row className="gap-[5px]">
      {['EN', 'FR', 'ES', 'RU'].map((l) => <span key={l} className={`${MONO} rounded-[5px] bg-(--ab-color-tint) px-[5px] py-px text-[10.5px] font-semibold text-(--ab-color-accent-text)`}>{l}</span>)}
    </Row>
  ),
};
