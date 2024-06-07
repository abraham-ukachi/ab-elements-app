import type { Metadata } from './metadata';
import type { Viewport } from './viewport';

import { Inter } from "next/font/google";
import { StaticMetadata } from './metadata';
import { StaticViewport } from './viewport';

import "./globals.css";


// export the static metadata
export const metadata: Metadata = StaticMetadata;
// expor the static viewport
export const viewport: Viewport = StaticViewport;


const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
