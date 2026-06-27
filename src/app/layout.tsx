import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ConsoleSignature } from "@/components/layouts/console-signature";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ogImage = `${siteUrl}/images/hvvn_header.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Debone",
  description: "from hvvn",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Debone",
    description: "from hvvn",
    type: "website",
    siteName: "Debone",
    images: [{ url: ogImage, alt: "Debone — from hvvn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debone",
    description: "from hvvn",
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,500;1,6..72,400&family=Pirata+One&family=Kanchenjunga&family=Gowun+Dodum&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <ConsoleSignature />
        <Analytics />
      </body>
    </html>
  );
}
