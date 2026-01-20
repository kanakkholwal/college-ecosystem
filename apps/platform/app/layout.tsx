import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter as FontSans, Space_Mono } from "next/font/google";
import Script from "next/script";
import { appConfig, orgConfig } from "~/project.config";
import "./global.css";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} | ${orgConfig.name}`,
    template: `%s | ${appConfig.name} - ${orgConfig.shortName}`,
  },
  description: appConfig.description,
  applicationName: appConfig.name,
  authors: appConfig.authors,
  creator: appConfig.creator,
  keywords: appConfig.keywords,
  metadataBase: new URL(appConfig.url),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: appConfig.seo.locale,
    url: appConfig.url,
    title: `${appConfig.name} | ${orgConfig.name}`,
    description: appConfig.description,
    siteName: appConfig.name,
    images: [
      {
        url: new URL("/social/og-image.jpg", appConfig.url).toString(),
        width: 1200,
        height: 630,
        alt: `${appConfig.name} - ${orgConfig.shortName}`,
      },
    ],
    phoneNumbers: [orgConfig.contact.phone],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    title: `${appConfig.name} | ${orgConfig.shortName}`,
    description: appConfig.description,
    images: [new URL(appConfig.logo, appConfig.url).toString()],
    creator: "@kanakkholwal",
    site: "@kanakkholwal",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/icon.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  // New SEO fields
  category: appConfig.seo.category,
  publisher: appConfig.seo.publisher,
  appLinks: {
    web: {
      url: appConfig.url,
      should_fallback: true,
    },
  },
  other: {
    "geo.position": appConfig.seo.geo.position,
    "geo.placename": appConfig.seo.geo.placename,
    "geo.region": appConfig.seo.geo.region,
    "og:locale:alternate": "hi_IN",
  },
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta
          name="google-adsense-account"
          content={appConfig.verifications.google_adsense}
        />
        <meta name="apple-mobile-web-app-title" content={appConfig.shortName} />

      </head>
      <body
        className={cn(
          "min-h-screen min-w-screen w-full antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgConfig.jsonLds.EducationalOrganization),
          }}
          id="json-ld-educational-organization"
          suppressHydrationWarning
        />
        {/* ✅ Load AdSense script once globally */}
        <Provider>{children} </Provider>
        {process.env.NODE_ENV === "production" && (<>
          <Script
            id="adsense-script"
            strategy="afterInteractive"
            async
            src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + appConfig.verifications.google_adsense}
            crossOrigin="anonymous"
          />
          <GoogleAnalytics gaId={appConfig.verifications.google_analytics} />
          {/* eslint-disable @next/next/no-img-element */}
          <div className="fixed bottom-2 right-2 left-auto top-auto z-50 flex gap-1 items-center">
            <span>
              <img
                height={20}
                width={80}
                src="https://visitor-badge.laobi.icu/badge?page_id=nith_portal.visitor-badge"
                alt="Visitor counter"
                className="inline-block font-inherit h-4"
                loading="lazy"
              />
            </span>
          </div>
        </>
        )}
      </body>
    </html>
  );
}
