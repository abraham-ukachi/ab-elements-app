// REACT types
import type { ReactNode } from 'react';

import type { Metadata } from './metadata';
import type { Viewport } from './viewport';

// import the Inter font class names from `ab-nextjs-fonts`
import { interStyles } from 'ab-nextjs-fonts';

import { APP_LANG, StaticMetadata } from './metadata';
import { StaticViewport } from './viewport';

import './globals.css';


// export the static metadata
export const metadata: Metadata = StaticMetadata;
// export the static viewport
export const viewport: Viewport = StaticViewport;


/**
 * `themeScript`
 *
 * Runs before the first paint to put the right Ab theme (`light` or `dark`) on `<html>`,
 * from the saved `theme` preference or the system's color scheme, so there's no theme flash.
 */
const themeScript: string = `(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();`;


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang={APP_LANG} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={interStyles.regular}>{children}</body>
    </html>
  );
}
