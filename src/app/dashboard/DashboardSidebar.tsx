"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./dashboard.module.scss";

interface DashboardSidebarProps {
  userName: string;
  isCustomer: boolean;
}

const NAV = (isCustomer: boolean) => [
  { href: "/dashboard",   label: "Dashboard",       icon: "◈" },
  ...(isCustomer
    ? [{ href: "/orders/new", label: "Nová objednávka", icon: "＋" }]
    : []),
];

export default function DashboardSidebar({ userName, isCustomer }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <Link href="/">Tailor<span>ent</span></Link>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV(isCustomer).map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.sidebarLink} ${pathname === href ? styles.sidebarLinkActive : ""}`}
          >
            <span className={styles.sidebarIcon}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarUser}>
        <div className={styles.sidebarAvatar}>
          {userName?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.sidebarUserInfo}>
          <strong>{userName}</strong>
          <span>{isCustomer ? "Zákazník" : "Krejčí"}</span>
        </div>
      </div>

      <div className={styles.sidebarBottom}>
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
