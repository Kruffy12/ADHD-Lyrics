import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Fraunces, Libre_Baskerville, Space_Grotesk, Syne, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displayNeon = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-display-neon" });
const displaySoft = Fraunces({ subsets: ["latin"], variable: "--font-display-soft" });
const displayInk = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-display-ink" });
const displayChrome = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-chrome" });
const displayCosmic = Syne({ subsets: ["latin"], variable: "--font-display-cosmic" });

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

export const metadata: Metadata = {
  title: "We Don't Bite — Sensory Lyrics",
  description:
    "Mobile-first iOS web app for rhythm-synced, multi-style lyric immersion.",
  applicationName: "Sensory Lyrics",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sensory Lyrics",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: `${basePath}/apple-touch-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050508" },
    { media: "(prefers-color-scheme: light)", color: "#f4efe6" },
  ],
};

const STARTUP_IMAGES = [
  {
    href: "/splash/iphone-14-pro-max.png",
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/splash/iphone-14-pro.png",
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/splash/iphone-14.png",
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/splash/iphone-14-plus.png",
    media:
      "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/splash/iphone-x.png",
    media:
      "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    href: "/splash/iphone-se.png",
    media:
      "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displayNeon.variable} ${displaySoft.variable} ${displayInk.variable} ${displayChrome.variable} ${displayCosmic.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {STARTUP_IMAGES.map((image) => (
          <link
            key={image.href}
            rel="apple-touch-startup-image"
            href={`${basePath}${image.href}`}
            media={image.media}
          />
        ))}
      </head>
      <body className="min-h-full overflow-hidden bg-[#050508] antialiased">{children}</body>
    </html>
  );
}
