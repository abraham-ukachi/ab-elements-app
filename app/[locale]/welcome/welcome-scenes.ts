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

// the 9 scenes, one per slide (in the mocks' spirit, with the REAL export names) 🎞️
export const WELCOME_SCENES: Readonly<Record<WelcomeSlideId, WelcomeScene>> = {
  // s01: the 8 packages wired to the logo 📦
  s01: hub('ab-elements', 'AbElements', ['core', 'components', 'theme', 'icons', 'fonts', 'animations', 'hooks', 'i18n']),
  // s02: core's layouts 🧱
  s02: hub('ab-nextjs-core', 'ab-nextjs-core', ['AbScreenLayout', 'AbMainLayout', 'AbAsideLayout']),
  // s03: components 🧩
  s03: hub('ab-nextjs-components', 'Components', ['AbButton', 'AbIconButton', 'AbTabs', 'AbMenu', 'AbSplash']),
  // s04: theme tokens 🌗
  s04: hub('ab-nextjs-theme', '--ab-*', ['light', 'dark', 'system', '--ab-color-bronze']),
  // s05: icons 🔣
  s05: hub('ab-nextjs-icons', '<AbIcon>', ['ab-icons', 'size', 'weight', 'filled']),
  // s06: the five font specimens around "Aa" 🔤
  s06: hub('ab-nextjs-fonts', 'Aa', ['Zilla Slab', 'Inter', 'Mulish', 'Quicksand', 'Roboto']),
  // s07: animations 🎬
  s07: hub('ab-nextjs-animations', 'ab-nextjs-animations', ['fade', 'slide', 'pop-in', 'reduced motion']),
  // s08: the hooks hub 🪝
  s08: hub('ab-nextjs-hooks', 'Hooks', ['useAbTheme', 'useAbMedia', 'useAbLocalStorage', 'useAbClipboard']),
  // s09: everything + docs + PWA 🚀
  s09: hub('ab-elements', 'AbElements', ['core', 'components', 'theme', 'icons', 'fonts', 'animations', 'hooks', 'i18n', 'docs', 'PWA'], 36, {
    // 10 spokes crowd the top: slide `core` left & `components` right so they never nearly touch (mobile) 📱↔️
    core: { dx: -5 },
    components: { dx: 5 },
  }),
};
