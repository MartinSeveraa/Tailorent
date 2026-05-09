"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./NotificationBell.module.scss";

type Notification = {
  id: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data ?? []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Zavři kliknutím mimo
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      await fetch("/api/notifications/read", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bell} onClick={handleOpen} aria-label="Oznámení">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownTitle}>Oznámení</p>
          {notifications.length === 0 ? (
            <p className={styles.empty}>Žádná oznámení</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => (
                <li key={n.id} className={`${styles.item} ${n.isRead ? styles.read : styles.unread}`}>
                  {n.link ? (
                    <Link href={n.link} className={styles.itemLink} onClick={() => setOpen(false)}>
                      {n.message}
                    </Link>
                  ) : (
                    <span className={styles.itemText}>{n.message}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
