// src/components/layout/Footer/Footer.tsx
import Link from "next/link";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            Krejčí<em>App</em>
          </span>
          <p className={styles.tagline}>
            Prémiové krejčovské služby přímo k vám domů.
          </p>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} KrejčíApp. Všechna práva vyhrazena.
          </p>
          <div className={styles.links}>
            <Link href="/gdpr">Ochrana osobních údajů</Link>
            <Link href="/podminky">Obchodní podmínky</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
