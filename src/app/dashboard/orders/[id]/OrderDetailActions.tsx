"use client";
// src/app/dashboard/orders/[id]/OrderDetailActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./orderDetail.module.scss";

type Props = {
  orderId: string;
  status: string;
  role: string;
  existingRating: number | null;
  price: number | null;
  priceAccepted: boolean | null;
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

export default function OrderDetailActions({ orderId, status, role, existingRating, price, priceAccepted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const submitReview = async () => {
    if (!selectedRating) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedRating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo.");
        return;
      }
      setReviewSuccess(true);
      router.refresh();
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  };

  const callApi = async (method: string, body?: Record<string, unknown>) => {
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

        {role === "CUSTOMER" && price !== null && priceAccepted === null && status !== "CANCELLED" && (
          <div className={styles.priceSection}>
            <p className={styles.priceLabel}>Stanovená cena</p>
            <p className={styles.priceValue}>{price.toLocaleString("cs-CZ")} Kč</p>
            <p className={styles.reviewHint}>Přijmete tuto cenu?</p>
            <div className={styles.priceActions}>
              <button
                className={styles.successBtn}
                disabled={loading}
                onClick={() => callApi("PUT", { priceAccepted: true })}
              >
                {loading ? "..." : "Přijmout cenu"}
              </button>
              <button
                className={styles.dangerBtn}
                disabled={loading}
                onClick={() => callApi("PUT", { priceAccepted: false })}
              >
                {loading ? "..." : "Odmítnout a zrušit"}
              </button>
            </div>
          </div>
        )}

        {role === "CUSTOMER" && price !== null && priceAccepted === true && (
          <p className={styles.actionDesc}>
            ✓ Cenu {price.toLocaleString("cs-CZ")} Kč jste přijali.
          </p>
        )}

        {role === "CUSTOMER" && status === "COMPLETED" && (
          <div className={styles.reviewSection}>
            <h3 className={styles.reviewTitle}>Hodnocení krejčího</h3>
            {existingRating !== null || reviewSuccess ? (
              <p className={styles.reviewDone}>
                ✓ Vaše hodnocení:{" "}
                {"★".repeat(existingRating ?? selectedRating)}
                {"☆".repeat(5 - (existingRating ?? selectedRating))}
              </p>
            ) : (
              <>
                <p className={styles.reviewHint}>Jak jste spokojeni s prací krejčího?</p>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.star} ${selectedRating >= star ? styles.starActive : ""}`}
                      onClick={() => setSelectedRating(star)}
                      aria-label={`${star} hvězdiček`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  className={styles.primaryBtn}
                  disabled={loading || selectedRating === 0}
                  onClick={submitReview}
                >
                  {loading ? "Odesílám..." : "Odeslat hodnocení"}
                </button>
              </>
            )}
          </div>
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
