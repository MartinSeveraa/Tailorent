"use client";

import { signOut } from "next-auth/react";
import styles from "./dashboard.module.scss";

export function LogoutButton() {
  return (
    <button
      type="button"
      className={styles.logoutBtn}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Odhlásit se
    </button>
  );
}

