import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Provider } from "./client-provider";

import "./globals.css";

import { Open_Sans } from "next/font/google";
// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AccessibilityBar } from './layouts/accessibility-bar';
import { Header } from './layouts/header';
import { Footer } from './layouts/footer';

const font = Open_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin-ext", "latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "NITH Portal",
  description:
    "NITH Portal is a platform for students of NITH to get all the resources at one place.",
  applicationName: "NITH Portal",
  authors: [{ name: "Kanak Kholwal", url: "https://kanakkholwal.eu.org" }],
  creator: "Kanak Kholwal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nith.eu.org"),
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "./manifest.json",
};


const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.className} bg-white text-gray-800`}>
        <AccessibilityBar />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
