import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { getLocale } from "@/data/locales";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Freela — Free Online Tools",
    template: "%s · Freela",
  },
  description: "Browser-first PDF, image, text, developer and calculator tools. Files stay on your device.",
  icons: {
    icon: [
      { url: `${siteUrl}/favicon.ico`, sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: `${siteUrl}/icon.png`, type: "image/png", sizes: "32x32" },
      { url: `${siteUrl}/favicon-32.png`, type: "image/png", sizes: "32x32" },
      { url: `${siteUrl}/favicon-16.png`, type: "image/png", sizes: "16x16" },
      { url: `${siteUrl}/favicon-48.png`, type: "image/png", sizes: "48x48" },
    ],
    shortcut: `${siteUrl}/favicon.ico`,
    apple: [{ url: `${siteUrl}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Freela" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const rec = getLocale(locale);
  return (
    <html
      lang={rec?.htmlLang || "en"}
      dir={rec?.dir || "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col bg-background text-foreground`}>{children}</body>
    </html>
  );
}
