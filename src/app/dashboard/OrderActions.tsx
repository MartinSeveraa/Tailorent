"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";

type Props = {
  orderId: string;
  status: string;
  role: string;
};

export default function OrderActions({ orderId, status, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const callApi = async (method: string, body?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (role === "CUSTOMER") {
    if (!["PENDING", "CONFIRMED"].includes(status)) return null;
    return (
      <button
        className={styles.actionBtnDanger}
        disabled={loading}
        onClick={() => callApi("DELETE")}
      >
        {loading ? "..." : "Zrušit"}
      </button>
    );
  }

  if (role === "TAILOR") {
    if (status === "CONFIRMED") {
      return (
        <button
          className={styles.actionBtn}
          disabled={loading}
          onClick={() => callApi("PUT", { status: "IN_PROGRESS" })}
        >
          {loading ? "..." : "Zahájit"}
        </button>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <button
          className={styles.actionBtnSuccess}
          disabled={loading}
          onClick={() => callApi("PUT", { status: "COMPLETED" })}
        >
          {loading ? "..." : "Dokončit"}
        </button>
      );
    }
  }

  return null;
}
