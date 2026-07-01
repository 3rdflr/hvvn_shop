import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Newsreader, Pirata_One, Kanchenjunga, Gowun_Dodum } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ConsoleSignature } from "@/components/layouts/console-signature";

// Self-hosted via next/font to eliminate the first-load font flicker (FOUT)
// that the previous Google Fonts <link> caused. Each font exposes a CSS
// variable consumed by globals.css. Korean (Gowun Dodum) isn't preloaded — its
// subset is large — but is still self-hosted with swap.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const pirataOne = Pirata_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pirata",
  display: "swap",
});
const kanchenjunga = Kanchenjunga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kanchenjunga",
  display: "swap",
});
const gowunDodum = Gowun_Dodum({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gowun",
  display: "swap",
  preload: false,
});

const fontVars = [
  newsreader.variable,
  pirataOne.variable,
  kanchenjunga.variable,
  gowunDodum.variable,
].join(" ");

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
    <html lang="ko" className={fontVars}>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <ConsoleSignature />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
