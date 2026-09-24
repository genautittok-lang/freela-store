import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { getLocale } from "@/data/locales";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://freela.store"),
  title: {
    default: "Freela — Free Online Tools",
    template: "%s · Freela",
  },
  description: "Browser-first PDF, image, text, developer and calculator tools. Files stay on your device.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
