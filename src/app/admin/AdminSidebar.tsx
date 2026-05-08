"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./admin.module.scss";

const NAV = [
  { href: "/admin/orders",   label: "Objednávky",    icon: "◈" },
  { href: "/admin/tailors",  label: "Krejčí",        icon: "✂" },
  { href: "/admin/services", label: "Správa služeb", icon: "⚙" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin/orders" className={styles.sidebarLogo}>
        Tailor<span>ent</span>
        <span className={styles.sidebarBadge}>Admin</span>
      </Link>

      <nav className={styles.sidebarNav}>
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
            >
              {icon && <span className={styles.sidebarIcon}>{icon}</span>}
              {label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <p className={styles.sidebarUserName}>{userName}</p>
        <button
          className={styles.logoutBtn}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Odhlásit se
        </button>
      </div>
    </aside>
  );
}
