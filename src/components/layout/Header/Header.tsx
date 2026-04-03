"use client";
// src/components/layout/Header/Header.tsx
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./Header.module.scss";

const NAV_LINKS = [
  { href: "#jak-pracujeme", label: "Jak pracujeme" },
  { href: "#sluzby", label: "Služby" },
  { href: "#pribeh", label: "O nás" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Tailor<span>ent</span>
        </Link>

        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {session?.user ? (
            <Link href="/dashboard" className={styles.account} aria-label="Můj účet">
              <span className={styles.accountIcon}>
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </Link>
          ) : (
            <Link href="/login" className={styles.login}>Přihlásit</Link>
          )}
          <Link href={session?.user ? "/dashboard" : "/register"} className={styles.cta}>
            Objednat
          </Link>
        </div>
      </div>
    </header>
  );
}