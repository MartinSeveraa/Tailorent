// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "@/styles/globals.scss";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Krejčí App — Prémiové krejčovské služby domů",
    template: "%s | Krejčí App",
  },
  description:
    "Objednejte si profesionálního krejčího přímo k vám domů. Úpravy oblečení, šití na míru, expresní služby.",
  keywords: ["krejčí", "úpravy oblečení", "šití na míru", "krejčovské služby"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
