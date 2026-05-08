"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.scss";
import { SERVICE_TYPE_LABELS } from "@/types";

type Props = {
  tailor: {
    id: string;
    locality: string;
    specializations: string[];
    isAvailable: boolean;
    rating: number;
    reviewCount: number;
    user: { name: string; email: string };
  };
};

export default function TailorItem({ tailor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/tailors/${tailor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !tailor.isAvailable }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Opravdu smazat krejčího ${tailor.user.name}?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/tailors/${tailor.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tailorCard}>
      <div className={styles.tailorInfo}>
        <span className={styles.tailorName}>{tailor.user.name}</span>
        <span className={styles.tailorMeta}>
          {tailor.locality} · {tailor.user.email}
        </span>
        <div className={styles.specs}>
          {tailor.specializations.map((s) => (
            <span key={s} className={styles.spec}>
              {SERVICE_TYPE_LABELS[s as keyof typeof SERVICE_TYPE_LABELS]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.tailorActions}>
        <span className={styles.tailorRating}>★ {tailor.rating.toFixed(1)}</span>
        <Link
          href={`/admin/tailors/${tailor.id}`}
          className={styles.toggleBtnOff}
          style={{ textDecoration: "none" }}
        >
          Upravit
        </Link>
        <button
          onClick={toggle}
          disabled={loading}
          className={tailor.isAvailable ? styles.toggleBtnOn : styles.toggleBtnOff}
        >
          {tailor.isAvailable ? "Dostupný" : "Nedostupný"}
        </button>
        <button onClick={remove} disabled={loading} className={styles.dangerBtn}>
          Smazat
        </button>
      </div>
    </div>
  );
}
