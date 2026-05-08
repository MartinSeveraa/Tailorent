"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";

// Header a Footer se zobrazí pouze na marketingové hlavní stránce
const MARKETING_PATHS = ["/"];

export function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = MARKETING_PATHS.includes(pathname);

  return (
    <>
      {showChrome && <Header />}
      {children}
      {showChrome && <Footer />}
    </>
  );
}
