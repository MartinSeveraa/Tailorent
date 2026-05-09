"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";

type Notification = {
  id: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type Props = {
  initial: Notification[];
};

export default function DashboardNotifications({ initial }: Props) {
  const [notifications, setNotifications] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const unread = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) return null;

  const markAllRead = async () => {
    await fetch("/api/notifications/read", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(() => router.refresh());
  };

  return (
    <div className={styles.notifSection}>
      <div className={styles.notifHeader}>
        <h2 className={styles.notifTitle}>
          Oznámení
          {unread > 0 && <span className={styles.notifBadge}>{unread}</span>}
        </h2>
        {unread > 0 && (
          <button className={styles.notifMarkBtn} onClick={markAllRead}>
            Označit vše jako přečtené
          </button>
        )}
      </div>

      <ul className={styles.notifList}>
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`${styles.notifItem} ${n.isRead ? styles.notifRead : styles.notifUnread}`}
          >
            {n.link ? (
              <Link href={n.link} className={styles.notifMessage}>
                {n.message}
              </Link>
            ) : (
              <span className={styles.notifMessage}>{n.message}</span>
            )}
            <span className={styles.notifTime}>
              {new Date(n.createdAt).toLocaleString("cs-CZ", {
                day: "numeric",
                month: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
