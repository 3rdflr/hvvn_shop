import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ConsoleSignature } from "@/components/layouts/console-signature";

// Resolve the public site URL. On Vercel, NEXT_PUBLIC_SITE_URL may be unset —
// fall back to the Vercel-provided domain so OG/Twitter images don't point at
// localhost (which is why share previews showed no image).
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();
const ogImage = {
  url: `${siteUrl}/images/hvvn_header.png`,
  width: 1400,
  height: 990,
  alt: "Debone — from hvvn",
};

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
    url: siteUrl,
    images: [ogImage],
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
