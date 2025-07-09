import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import { Inter, Orbitron, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { type ReactNode } from "react";
import React from "react";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"]
});

// Press Start 2P for pixelated look
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight: "400"
});

export const metadata: Metadata = {
  title: "DeFi Tax Analyzer",
  description: "Analyze DeFi positions for long-term capital gains optimization. Pay $1, get instant tax insights.",
  keywords: ["defi", "tax", "capital gains", "crypto", "ethereum", "base", "farcaster"],
  authors: [{ name: "DeFi Tax Team" }],

  // Open Graph metadata for social sharing and embeds
  openGraph: {
    title: "DeFi Tax Analyzer",
    description: "Analyze DeFi positions for long-term capital gains optimization. Pay $1, get instant tax insights.",
    type: "website",
    url: process.env.NEXT_PUBLIC_URL || "https://example.com/",
    siteName: "DeFi Tax Analyzer",
    images: [
      {
        url: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "/hero.png",
        width: 1200,
        height: 630,
        alt: "DeFi Tax Analyzer",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "DeFi Tax Analyzer",
    description: "Analyze DeFi positions for long-term capital gains optimization. Pay $1, get instant tax insights.",
    images: [process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "/hero.png"],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DeFi Tax Analyzer",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
  },

  // Farcaster Frame metadata
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      button: {
        title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DeFi Tax Analyzer"}`,
        action: {
          type: "launch_frame",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DeFi Tax Analyzer",
          url: process.env.NEXT_PUBLIC_URL,
          splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
          splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0052ff" },
    { media: "(prefers-color-scheme: dark)", color: "#001829" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Additional meta tags for mini app embedding */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "DeFi Tax Analyzer"} />

        {/* Prevent zooming and ensure proper scaling in mini apps */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
      <body className={`${inter.className} ${orbitron.variable} ${pressStart2P.variable} h-full antialiased bg-[#0052ff] text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
