import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrossRap — Onde o rap encontra as palavras",
  description: "Palavras cruzadas sobre Rap, Hip Hop, batalhas, graffiti, breaking e muito mais.",
  manifest: "/manifest.json",
  themeColor: "#090909",
  openGraph: {
    title: "CrossRap",
    description: "Onde o rap encontra as palavras.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "CrossRap" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className={`${geist.variable} ${mono.variable}`}>{children}</body></html>;
}
