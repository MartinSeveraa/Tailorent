import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ConditionalWrapper } from "@/components/layout/ConditionalWrapper";
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
    default: "Tailorent — Prémiové krejčovské služby domů",
    template: "%s | Tailorent",
  },
  description: "Objednejte si profesionálního krejčího přímo k vám domů.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <Providers>
          <ConditionalWrapper>
            {children}
          </ConditionalWrapper>
        </Providers>
      </body>
    </html>
  );
}