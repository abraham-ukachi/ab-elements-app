import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coming Soon 🫶🏼 - abElements",
  description: "A lightweight library of 100% free UI elements for your Next.js, React, Vue, Lit and Flutter projects, created with ❤️  by Abraham UKachi.",
};

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
