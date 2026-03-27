// src/components/layout/Header/Header.tsx
import Link from "next/link";
import styles from "./Header.module.scss";
import { Button } from "@/components/ui/Button/Button";

const NAV_LINKS = [
  { href: "#sluzby", label: "Služby" },
  { href: "#jak-to-funguje", label: "Jak to funguje" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Krejčí<span>App</span>
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button href="/login" variant="ghost" size="sm">
            Přihlásit se
          </Button>
          <Button href="/register" variant="primary" size="sm">
            Registrace
          </Button>
        </div>
      </div>
    </header>
  );
}
