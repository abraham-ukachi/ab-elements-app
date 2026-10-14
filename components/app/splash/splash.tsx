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
* @name: abElements Splash - Overlay
* @file: components/app/splash/splash.tsx
* @type: TypeScript + JSX
* @authors: Abraham Ukachi <abrahamukachi@gmail.com>
*
* Example usage:
*   1+|> <Splash /> // in the root layout's `<body>`, before the page 🚀
*    -|>
*
*/


/*
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
* MOTTO: We'll always do more 😜!!!
* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


// a client component (it hides itself after hydration 💧)
'use client';

// import the React hooks we need
import { useEffect, useState } from 'react';
// import `clsx` (to join the class names)
import clsx from 'clsx';

// import the Ab logo (the AbElements mark) from `ab-nextjs-components` 🅰️
import { AbLogo } from 'ab-nextjs-components/ab-logo';
// import the linear progress from `ab-nextjs-core` 📶
import AbLinearProgress from 'ab-nextjs-core/ab-linear-progress';
// import the Quicksand font styles from `ab-nextjs-fonts` (for the wordmark 🔤)
import { quicksandStyles } from 'ab-nextjs-fonts';

// import the Splash gate helpers 🚦
import {
  AB_SPLASH_ATTRIBUTE,
  getAbSplashFadeMs,
  getAbSplashRemainingMs,
  waitForAbSplashReady,
} from './splash-gate';
// import the Splash styles 🎨
import styles from './splash.module.css';


/**
 * `Splash` - Splash Overlay 💦
 *
 * The AbElements Splash: the mark + "Elements" wordmark and a linear progress, in light & dark.
 * It's server-rendered but hidden by CSS unless the gate script set `data-ab-splash="on"` on `<html>`,
 * so with JS off it never shows. Once hydrated, it waits for the fonts (max 1.2 s) and fades out.
 *
 * @returns { ReactElement }
 */
export default function Splash() {
  // the progress shown by `AbLinearProgress` (25% until hydration 💧)
  const [progress, setProgress] = useState<number>(25);

  // after hydration...
  useEffect(() => {
    // the `<html>` element (where the gate put its flag 🚩)
    const root = document.documentElement;
    // no flag? nothing to do 😴
    if (root.getAttribute(AB_SPLASH_ATTRIBUTE) !== 'on') return;

    // whether this effect is still alive (unmount safety 🛟)
    let alive = true;
    // the fade-out timer
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    // hydrated: move the progress on (next frame) ➡️
    const frame = requestAnimationFrame(() => setProgress(60));

    // does the user prefer reduced motion? ♿️
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // the time left before the 1.2 s cap ⏳
    const remaining = getAbSplashRemainingMs(performance.now());

    // wait for the fonts (or the cap), then hide 👋
    waitForAbSplashReady(document.fonts?.ready, remaining).then(() => {
      // unmounted meanwhile? stop here
      if (!alive) return;
      // all done: fill the progress ✅
      setProgress(100);
      // start the fade-out (CSS) 🌫️
      root.setAttribute(AB_SPLASH_ATTRIBUTE, 'leaving');
      // then remove the flag for good (at once with reduced motion)
      fadeTimer = setTimeout(() => root.removeAttribute(AB_SPLASH_ATTRIBUTE), getAbSplashFadeMs(reduced));
    });

    // cleanup 🧹
    return () => {
      // mark the effect as dead
      alive = false;
      // cancel the pending frame
      cancelAnimationFrame(frame);
      // clear the fade timer
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  return (
    // the overlay (decorative, so hidden from assistive tech 🙈)
    <div className={clsx('AbSplash', styles.splash)} aria-hidden="true">
      {/* the brand: mark + wordmark */}
      <div className={styles.brand}>
        {/* the AbElements mark 🅰️ */}
        <AbLogo type="contained" alt="" className={styles.logo} />
        {/* the "Elements" wordmark (a brand name, never translated) */}
        <span className={clsx(quicksandStyles.bold, styles.wordmark)}>Elements</span>
      </div>
      {/* the progress 📶 */}
      <AbLinearProgress className={styles.progress} hidden={false} progress={progress} />
    </div>
  );
}
