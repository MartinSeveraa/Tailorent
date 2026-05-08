"use client";
// src/app/dashboard/orders/[id]/OrderDetailActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./orderDetail.module.scss";

type Props = {
  orderId: string;
  status: string;
  role: string;
};

const STATUS_DESC: Record<string, Record<string, string>> = {
  CUSTOMER: {
    PENDING: "Vaše objednávka čeká na přiřazení krejčího.",
    CONFIRMED: "Objednávka je potvrzena. Krejčí brzy dorazí.",
    IN_PROGRESS: "Krejčí právě pracuje na vaší objednávce.",
    COMPLETED: "Objednávka byla úspěšně dokončena.",
    CANCELLED: "Tato objednávka byla zrušena.",
  },
  TAILOR: {
    PENDING: "Zakázka čeká na přiřazení krejčího.",
    CONFIRMED: "Zakázka je potvrzena a čeká na zahájení.",
    IN_PROGRESS: "Práce probíhá. Označte jako dokončenou po skončení.",
    COMPLETED: "Zakázka byla úspěšně dokončena.",
    CANCELLED: "Tato zakázka byla zrušena.",
  },
};

export default function OrderDetailActions({ orderId, status, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callApi = async (method: string, body?: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Něco se pokazilo.");
        return;
      }
      router.refresh();
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  };

  const desc = STATUS_DESC[role]?.[status] ?? "";

  return (
    <div className={styles.actionsCard}>
      <h2 className={styles.cardTitle}>Akce</h2>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actionsSection}>
        {desc && <p className={styles.actionDesc}>{desc}</p>}

        {role === "CUSTOMER" && ["PENDING", "CONFIRMED"].includes(status) && (
          <button
            className={styles.dangerBtn}
            disabled={loading}
            onClick={() => callApi("DELETE")}
          >
            {loading ? "Ruším..." : "Zrušit objednávku"}
          </button>
        )}

        {role === "TAILOR" && status === "CONFIRMED" && (
          <button
            className={styles.primaryBtn}
            disabled={loading}
            onClick={() => callApi("PUT", { status: "IN_PROGRESS" })}
          >
            {loading ? "..." : "Zahájit práci"}
          </button>
        )}

        {role === "TAILOR" && status === "IN_PROGRESS" && (
          <button
            className={styles.successBtn}
            disabled={loading}
            onClick={() => callApi("PUT", { status: "COMPLETED" })}
          >
            {loading ? "..." : "Označit jako dokončeno"}
          </button>
        )}
      </div>
    </div>
  );
}
