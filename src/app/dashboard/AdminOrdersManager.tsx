"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/types";
import styles from "./dashboard.module.scss";

type AdminOrder = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  serviceType: "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";
  description: string | null;
  address: string;
  city: string;
  scheduledAt: string | Date;
  price: number | null;
  notes: string | null;
  tailorId: string | null;
  customer?: { name: string; email: string } | null;
  tailor?: { user?: { name: string; email: string } | null } | null;
};

type TailorOption = {
  id: string;
  name: string;
  email: string;
  locality: string;
};

type EditState = {
  description: string;
  price: string;
  notes: string;
  status: AdminOrder["status"];
  tailorId: string;
};

type TabKey = "pending" | "confirmed" | "completed";

export function AdminOrdersManager({ orders, tailors }: { orders: AdminOrder[]; tailors: TailorOption[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [edits, setEdits] = useState<Record<string, EditState>>(
    Object.fromEntries(
      orders.map((o) => [
        o.id,
        {
          description: o.description ?? "",
          price: o.price != null ? String(o.price) : "",
          notes: o.notes ?? "",
          status: o.status,
          tailorId: o.tailorId ?? "",
        },
      ])
    )
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const groups = useMemo(
    () => ({
      pending: orders.filter((o) => o.status === "PENDING"),
      confirmed: orders.filter((o) => o.status === "CONFIRMED" || o.status === "IN_PROGRESS"),
      completed: orders.filter((o) => o.status === "COMPLETED"),
    }),
    [orders]
  );

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "pending", label: "Čeká na přiřazení", count: groups.pending.length },
    { key: "confirmed", label: "Potvrzeno", count: groups.confirmed.length },
    { key: "completed", label: "Dokončeno", count: groups.completed.length },
  ];

  const setField = (orderId: string, field: keyof EditState, value: string) => {
    setEdits((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }));
  };

  const saveOrder = async (orderId: string, assignAndConfirm = false) => {
    const edit = edits[orderId];
    if (!edit) return;

    setLoadingId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const payload: Record<string, unknown> = {
        description: edit.description,
        notes: edit.notes,
        status: assignAndConfirm ? "CONFIRMED" : edit.status,
      };

      if (edit.tailorId) payload.tailorId = edit.tailorId;
      if (edit.price.trim()) {
        const num = Number(edit.price);
        if (!Number.isFinite(num) || num <= 0) {
          setErrorById((prev) => ({ ...prev, [orderId]: "Cena musí být kladné číslo." }));
          setLoadingId(null);
          return;
        }
        payload.price = num;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorById((prev) => ({ ...prev, [orderId]: data.error ?? "Nepodařilo se uložit změny." }));
        return;
      }
      router.refresh();
    } catch {
      setErrorById((prev) => ({ ...prev, [orderId]: "Chyba připojení. Zkuste to znovu." }));
    } finally {
      setLoadingId(null);
    }
  };

  const renderSection = (title: string, sectionOrders: AdminOrder[], pendingSection = false) => (
    <div className={styles.adminSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {sectionOrders.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Žádné objednávky v této kategorii.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {sectionOrders.map((order) => {
            const edit = edits[order.id];
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderCardLeft}>
                  <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <p className={styles.orderMeta}>
                    Zákazník: {order.customer?.name ?? "Neznámý"} ({order.customer?.email ?? "—"})
                  </p>
                  <p className={styles.orderMeta}>
                    Adresa: {order.address}, {order.city}
                  </p>
                  <p className={styles.orderMeta}>Termín: {formatDate(new Date(order.scheduledAt))}</p>
                  <p className={styles.orderMeta}>Služba: {order.serviceType}</p>

                  <div className={styles.adminFields}>
                    <label className={styles.label}>Popis</label>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={edit.description}
                      onChange={(e) => setField(order.id, "description", e.target.value)}
                    />

                    <label className={styles.label}>Cena (Kč)</label>
                    <input
                      className={styles.textarea}
                      value={edit.price}
                      onChange={(e) => setField(order.id, "price", e.target.value)}
                      placeholder="Např. 950"
                    />

                    <label className={styles.label}>Poznámka</label>
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      value={edit.notes}
                      onChange={(e) => setField(order.id, "notes", e.target.value)}
                    />

                    <label className={styles.label}>Stav</label>
                    <select
                      className={styles.textarea}
                      value={edit.status}
                      onChange={(e) => setField(order.id, "status", e.target.value)}
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <label className={styles.label}>Přiřazený krejčí</label>
                    <select
                      className={styles.textarea}
                      value={edit.tailorId}
                      onChange={(e) => setField(order.id, "tailorId", e.target.value)}
                    >
                      <option value="">Bez přiřazení</option>
                      {tailors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — {t.locality || "Neurčeno"} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {errorById[order.id] && <p className={styles.error}>{errorById[order.id]}</p>}

                  <div className={styles.adminActions}>
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      onClick={() => saveOrder(order.id)}
                      disabled={loadingId === order.id}
                    >
                      {loadingId === order.id ? "Ukládám..." : "Uložit změny"}
                    </button>
                    {pendingSection && (
                      <button
                        type="button"
                        className={styles.confirmBtn}
                        onClick={() => saveOrder(order.id, true)}
                        disabled={loadingId === order.id || !edit.tailorId}
                      >
                        Přiřadit krejčího
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.adminGrid}>
      <div className={styles.adminTabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.adminTab} ${activeTab === tab.key ? styles.adminTabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={styles.adminTabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "pending" && renderSection("Čeká na přiřazení", groups.pending, true)}
      {activeTab === "confirmed" && renderSection("Potvrzeno", groups.confirmed)}
      {activeTab === "completed" && renderSection("Dokončeno", groups.completed)}
    </div>
  );
}

