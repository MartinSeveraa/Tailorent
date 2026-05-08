"use client";

import { useState } from "react";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import styles from "./dashboard.module.scss";

type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type ServiceType = "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";

type Order = {
  id: string;
  status: OrderStatus;
  serviceType: ServiceType;
  address: string;
  city: string;
  scheduledAt: Date;
  price: number | null;
  tailorId: string | null;
  tailorName: string | null;
  hasReview: boolean;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= (hovered || value) ? styles.starActive : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} hvězdiček`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function CustomerOrderList({ orders }: { orders: Order[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggle = (id: string, status: OrderStatus) => {
    if (status !== "COMPLETED") return;
    setExpanded((prev) => (prev === id ? null : id));
  };

  const submitReview = async (orderId: string) => {
    const rating = ratings[orderId];
    if (!rating) {
      setErrors((e) => ({ ...e, [orderId]: "Vyberte počet hvězdiček." }));
      return;
    }

    setSubmitting(orderId);
    setErrors((e) => ({ ...e, [orderId]: "" }));

    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [orderId]: data.error ?? "Chyba při odesílání." }));
        return;
      }
      setSubmitted((s) => new Set(s).add(orderId));
      setExpanded(null);
    } catch {
      setErrors((e) => ({ ...e, [orderId]: "Chyba připojení." }));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className={styles.orderList}>
      {orders.map((order) => {
        const isCompleted = order.status === "COMPLETED";
        const alreadyReviewed = order.hasReview || submitted.has(order.id);
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderCardLeft}>
              <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <h3 className={styles.orderService}>
                {SERVICE_TYPE_LABELS[order.serviceType]}
              </h3>
              <p className={styles.orderMeta}>
                {order.address}, {order.city}
              </p>
              <p className={styles.orderMeta}>
                Krejčí: {order.tailorName ?? "Čeká na přiřazení"}
              </p>

              {isCompleted && (
                <div className={styles.reviewWrap}>
                  {alreadyReviewed ? (
                    <span className={styles.reviewDone}>✓ Hodnocení odesláno</span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.reviewToggleBtn}
                        onClick={() => toggle(order.id, order.status)}
                      >
                        {isOpen ? "Zrušit" : "Hodnotit krejčího"}
                      </button>

                      {isOpen && (
                        <div className={styles.reviewForm}>
                          <p className={styles.reviewLabel}>Vaše hodnocení:</p>
                          <StarRating
                            value={ratings[order.id] ?? 0}
                            onChange={(v) =>
                              setRatings((r) => ({ ...r, [order.id]: v }))
                            }
                          />
                          {errors[order.id] && (
                            <p className={styles.reviewError}>{errors[order.id]}</p>
                          )}
                          <button
                            type="button"
                            className={styles.confirmBtn}
                            onClick={() => submitReview(order.id)}
                            disabled={submitting === order.id}
                          >
                            {submitting === order.id ? "Odesílám…" : "Odeslat hodnocení"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className={styles.orderCardRight}>
              <span className={styles.orderDate}>{formatDate(order.scheduledAt)}</span>
              {order.price != null && (
                <span className={styles.orderPrice}>{formatPrice(order.price)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
