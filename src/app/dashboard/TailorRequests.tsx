"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import styles from "./dashboard.module.scss";

type TailorOrder = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  serviceType: "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";
  description: string | null;
  address: string;
  city: string;
  scheduledAt: string | Date;
  notes: string | null;
  customer?: { name: string; email: string } | null;
};

export function TailorRequests({ orders }: { orders: TailorOrder[] }) {
  const router = useRouter();
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const setNote = (orderId: string, value: string) => {
    setNotesById((prev) => ({ ...prev, [orderId]: value }));
  };

  const confirmOrder = async (orderId: string) => {
    setLoadingId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesById[orderId] ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorById((prev) => ({ ...prev, [orderId]: data.error ?? "Nepodařilo se potvrdit termín." }));
        return;
      }
      router.refresh();
    } catch {
      setErrorById((prev) => ({ ...prev, [orderId]: "Chyba připojení. Zkuste to znovu." }));
    } finally {
      setLoadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Zatím žádné požadavky od zákazníků.</p>
      </div>
    );
  }

  return (
    <div className={styles.orderList}>
      {orders.map((order) => {
        const isPending = order.status === "PENDING";
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
                Zákazník: {order.customer?.name ?? "Neznámý"} ({order.customer?.email ?? "—"})
              </p>
              <p className={styles.orderMeta}>
                Adresa: {order.address}, {order.city}
              </p>
              {order.description && (
                <p className={styles.orderMeta}>Popis: {order.description}</p>
              )}

              <div className={styles.tailorActionWrap}>
                <label className={styles.label} htmlFor={`notes-${order.id}`}>
                  Poznámka pro potvrzení termínu
                </label>
                <textarea
                  id={`notes-${order.id}`}
                  className={styles.textarea}
                  rows={3}
                  value={notesById[order.id] ?? order.notes ?? ""}
                  onChange={(e) => setNote(order.id, e.target.value)}
                  placeholder="Např. Potvrzuji termín, dorazím 15 minut předem."
                />
                {errorById[order.id] && (
                  <p className={styles.error}>{errorById[order.id]}</p>
                )}
                <button
                  type="button"
                  className={styles.confirmBtn}
                  onClick={() => confirmOrder(order.id)}
                  disabled={!isPending || loadingId === order.id}
                >
                  {loadingId === order.id ? "Potvrzuji..." : isPending ? "Potvrdit termín" : "Termín potvrzen"}
                </button>
              </div>
            </div>

            <div className={styles.orderCardRight}>
              <span className={styles.orderDate}>
                {formatDate(new Date(order.scheduledAt))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

