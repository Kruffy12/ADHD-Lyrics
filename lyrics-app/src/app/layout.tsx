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
    icon: [{ url: `${basePath}/icons/icon.svg`, type: "image/svg+xml" }],
    apple: [{ url: `${basePath}/icons/icon.svg` }],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displayNeon.variable} ${displaySoft.variable} ${displayInk.variable} ${displayChrome.variable} ${displayCosmic.variable} h-full`}
    >
      <body className="min-h-full overflow-hidden bg-black antialiased">{children}</body>
    </html>
  );
}
