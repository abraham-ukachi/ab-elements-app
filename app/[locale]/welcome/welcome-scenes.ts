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
* @name: abElements Welcome Scenes
* @file: app/[locale]/welcome/welcome-scenes.ts
* @type: TypeScript
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> import { WELCOME_SCENES } from './welcome-scenes';
*    -|> 
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// 🗺️ Welcome scenes: the 9 "Live Playground" diagrams as DATA (nodes + wires).
// The packaged `AbFlowDiagram` draws them; a redesign only swaps this data + the messages 🔁.
// Node labels are code names (packages, components, hooks, tokens): they're NEVER translated 🔒.

// import the node / wire types from the packaged flow diagram 🧾
import type { AbFlowEdge, AbFlowNode } from 'ab-nextjs-components/ab-flow-diagram';

// import the slide id type of the Welcome 🎞️
import type { WelcomeSlideId } from './welcome';


// one scene: its nodes, its wires and its `PKG` caption 🗺️
export interface WelcomeScene {
  caption: string; // 🏷️ the mono `PKG` label
  nodes: readonly AbFlowNode[]; // 🔵 nodes (0–100 coordinates)
  edges: readonly AbFlowEdge[]; // 〰️ wires
}

// a hub-and-spokes scene: one hub in the middle, the spokes on a circle around it 🎡
// `nudge` optionally shifts named spokes (in 0–100 units) to pull crowded neighbours apart 🤏↔️
function hub(
  caption: string,
  center: string,
  spokes: readonly string[],
  radius = 36,
  nudge: Readonly<Record<string, { dx?: number; dy?: number }>> = {},
): WelcomeScene {
  // the hub node (centre) 🎯
  const nodes: AbFlowNode[] = [{ id: 'hub', label: center, x: 50, y: 50, tone: 'hub' }];
  // one wire per spoke 〰️
  const edges: AbFlowEdge[] = [];
  // place every spoke on the circle (starting at the top, clockwise) 🧭
  spokes.forEach((label, i) => {
    // the angle of this spoke (in radians)
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / spokes.length;
    // the spoke's id
    const id = `n${i}`;
    // the spoke node (rounded to one decimal so SSR and the client agree 🤝)
    // this spoke's optional nudge (none by default) 🤏
    const { dx = 0, dy = 0 } = nudge[label] ?? {};
    nodes.push({
      id,
      label,
      x: Math.round((50 + radius * Math.cos(angle) + dx) * 10) / 10,
      y: Math.round((50 + radius * Math.sin(angle) + dy) * 10) / 10,
    });
    // its wire to the hub, slightly curved 🌙
    edges.push({ from: id, to: 'hub', curve: i % 2 === 0 ? 0.15 : -0.15 });
  });
  // return the scene
  return { caption, nodes, edges };
}

// 📐 John's v6 card is 760×600 px; a v6 node is a px rect [left, top, width, height] → its centre in 0–100 units 🎯
type V6Rect = readonly [number, number, number, number];
const V6_W = 760; // ↔️ the v6 playground card width
const V6_H = 600; // ↕️ the v6 playground card height
const v6Center = ([left, top, width, height]: V6Rect) => ({
  x: Math.round(((left + width / 2) / V6_W) * 1000) / 10, // ↔️ one decimal (SSR = client 🤝)
  y: Math.round(((top + height / 2) / V6_H) * 1000) / 10, // ↕️
});

// 🎨 a v6 scene (John's `scene_nodes(k)` in welcome-v6/_src/scenes.py): one hub + six nodes, 3 above · 3 below,
//    at the mock's exact positions, each wired to the hub. The labels are the mock's node captions (code-ish names,
//    never translated 🔒). The mock's RICH node content (buttons, swatches, code) needs a package slot (gap reported).
function v6(
  caption: string,
  center: readonly [string, V6Rect],
  spokes: readonly (readonly [string, V6Rect])[],
): WelcomeScene {
  // the hub (centre) 🎯
  const nodes: AbFlowNode[] = [{ id: 'hub', label: center[0], ...v6Center(center[1]), tone: 'hub' }];
  // the six spokes + their wires 〰️
  const edges: AbFlowEdge[] = [];
  spokes.forEach(([label, rect], i) => {
    nodes.push({ id: `n${i}`, label, ...v6Center(rect) });
    edges.push({ from: `n${i}`, to: 'hub', curve: i % 2 === 0 ? 0.15 : -0.15 });
  });
  return { caption, nodes, edges };
}

// 🚧 PLACEHOLDER (8th package): John is still designing the `ab-nextjs-i18n` playground illustration (v6 has 7:
//    core · components · theme · icons · fonts · animations · hooks). Until it lands, i18n only appears as a plain
//    spoke of the s01 / s09 hubs below; swap its v6 scene in here when the mock ships 🔁
export const WELCOME_SCENE_PLACEHOLDERS = ['ab-nextjs-i18n'] as const;

// the 9 scenes, one per slide (s02–s08 = John's v6 illustrations; s01 / s09 = every package around the logo) 🎞️
export const WELCOME_SCENES: Readonly<Record<WelcomeSlideId, WelcomeScene>> = {
  // s01: the 8 packages wired to the logo 📦 (🚧 `i18n` = the placeholder spoke, see WELCOME_SCENE_PLACEHOLDERS)
  s01: hub('ab-elements', 'AbElements', ['core', 'components', 'theme', 'icons', 'fonts', 'animations', 'hooks', 'i18n']),
  // s02: core (v6 k=1) 🧱
  s02: v6('ab-nextjs-core', ['<AbProvider>', [250, 282, 260, 76]], [
    ['ab.config.ts', [40, 104, 190, 92]], ['<Slot/>', [300, 112, 160, 60]], ['"use client"', [530, 104, 190, 92]],
    ['Focus ring', [40, 450, 200, 70]], ['<Portal/>', [290, 460, 180, 56]], ['dir="ltr"', [530, 450, 190, 70]],
  ]),
  // s03: components (v6 k=2) 🧩
  s03: v6('ab-nextjs-components', ['ab-nextjs-components', [250, 288, 260, 70]], [
    ['<Button/>', [40, 96, 150, 104]], ['<Switch/>', [240, 118, 140, 58]], ['<Tabs/>', [430, 116, 290, 62]],
    ['<Sheet/>', [40, 430, 220, 130]], ['<Avatar/>', [310, 450, 140, 90]], ['<BottomNav/>', [500, 440, 220, 110]],
  ]),
  // s04: theme (v6 k=3) 🌗
  s04: v6('ab-nextjs-theme', ['<ThemeProvider/>', [230, 280, 300, 84]], [
    ['tokens.css', [40, 100, 210, 104]], ['color-scheme', [300, 120, 160, 62]], ['light / dark', [510, 96, 210, 110]],
    ['--radius', [40, 450, 210, 80]], ['AAA 7.2 : 1', [300, 456, 160, 64]], ['@theme', [510, 450, 210, 80]],
  ]),
  // s05: icons (v6 k=4) 🔣
  s05: v6('ab-nextjs-icons', ['icon set', [220, 260, 320, 128]], [
    ['size', [40, 104, 200, 84]], ['variant', [290, 112, 180, 64]], ['<Icon/>', [520, 104, 200, 84]],
    ['bundle', [40, 456, 200, 70]], ['fill axis', [290, 456, 180, 70]], ['typed', [520, 456, 200, 70]],
  ]),
  // s06: fonts (v6 k=5) 🔤
  s06: v6('ab-nextjs-fonts', ['Aa', [250, 262, 260, 120]], [
    ['Zilla Slab', [40, 100, 210, 96]], ['Inter', [300, 112, 160, 64]], ['Mulish', [510, 100, 210, 96]],
    ['font-*', [40, 456, 210, 74]], ['Quicksand', [300, 456, 160, 74]], ['Roboto', [510, 456, 210, 74]],
  ]),
  // s07: animations / motion (v6 k=6) 🎬
  s07: v6('ab-nextjs-animations', ['ease-out', [220, 262, 320, 128]], [
    ['spring', [40, 100, 210, 96]], ['duration', [300, 112, 160, 64]], ['preset', [510, 104, 210, 84]],
    ['reduced motion', [40, 456, 230, 74]], ['<Animate/>', [320, 456, 140, 74]], ['list', [510, 456, 210, 74]],
  ]),
  // s08: hooks (v6 k=7) 🪝
  s08: v6('ab-nextjs-hooks', ['ab-nextjs-hooks', [260, 286, 240, 72]], [
    ['useTheme()', [40, 110, 200, 64]], ['useMedia("md")', [280, 110, 200, 64]], ['useHotkey("mod+k")', [520, 110, 200, 64]],
    ['useLocalStorage(k)', [40, 460, 200, 64]], ['useMounted()', [280, 460, 200, 64]], ['useClipboard()', [520, 460, 200, 64]],
  ]),
  // s09: everything + docs + PWA 🚀
  s09: hub('ab-elements', 'AbElements', ['core', 'components', 'theme', 'icons', 'fonts', 'animations', 'hooks', 'i18n', 'docs', 'PWA'], 36, {
    // 10 spokes crowd the top: slide `core` left & `components` right so they never nearly touch (mobile) 📱↔️
    core: { dx: -5 },
    components: { dx: 5 },
  }),
};
