"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.scss";

type Props = {
  service: {
    id: string;
    name: string;
    description: string;
    icon: string;
    basePrice: number;
    isActive: boolean;
    showOnHomepage: boolean;
  };
  homepageCount: number;
};

export default function ServiceItem({ service, homepageCount }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const patch = async (data: object) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Chyba"); return; }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Opravdu smazat službu „${service.name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const canAddHomepage = homepageCount < 3 || service.showOnHomepage;

  return (
    <div className={styles.tailorCard} style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div className={styles.tailorInfo}>
          <span className={styles.tailorName}>
            {service.icon} {service.name}
          </span>
          {service.description && (
            <span className={styles.tailorMeta}>{service.description}</span>
          )}
          <span className={styles.tailorMeta}>
            Základní cena:{" "}
            <span style={{ color: "#c9a84c" }}>
              {service.basePrice > 0 ? `od ${service.basePrice} Kč` : "Nezadáno"}
            </span>
            {service.showOnHomepage && (
              <span style={{ marginLeft: "12px", color: "#4ade80", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                ● Homepage
              </span>
            )}
          </span>
        </div>

        <div className={styles.tailorActions}>
          <Link
            href={`/admin/services/${service.id}`}
            className={styles.toggleBtnOff}
            style={{ textDecoration: "none" }}
          >
            Upravit
          </Link>
          <button
            onClick={() => patch({ isActive: !service.isActive })}
            disabled={loading}
            className={service.isActive ? styles.toggleBtnOn : styles.toggleBtnOff}
          >
            {service.isActive ? "Aktivní" : "Neaktivní"}
          </button>
          <button
            onClick={() => patch({ showOnHomepage: !service.showOnHomepage })}
            disabled={loading || (!canAddHomepage)}
            className={service.showOnHomepage ? styles.toggleBtnOn : styles.toggleBtnOff}
            title={!canAddHomepage ? "Na homepage jsou již 3 služby" : undefined}
          >
            {service.showOnHomepage ? "Na homepage ✓" : "Na homepage"}
          </button>
          <button onClick={remove} disabled={loading} className={styles.dangerBtn}>
            Smazat
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error} style={{ margin: 0 }}>{error}</div>
      )}
    </div>
  );
}
