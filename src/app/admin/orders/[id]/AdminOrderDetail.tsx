"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.scss";

type Tailor = { id: string; locality: string; user: { name: string } };

type Props = {
  order: {
    id: string;
    status: string;
    price: number | null;
    notes: string | null;
    tailorId: string | null;
  };
  tailors: Tailor[];
};

const STATUSES = [
  { value: "PENDING",     label: "Čekající" },
  { value: "CONFIRMED",   label: "Potvrzena" },
  { value: "IN_PROGRESS", label: "Probíhá" },
  { value: "COMPLETED",   label: "Dokončena" },
  { value: "CANCELLED",   label: "Zrušena" },
];

export default function AdminOrderDetail({ order, tailors }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(order.status);
  const [tailorId, setTailorId] = useState(order.tailorId ?? "");
  const [price,   setPrice]   = useState(order.price?.toString() ?? "");
  const [notes,   setNotes]   = useState(order.notes ?? "");
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  const call = async (data: Record<string, unknown>) => {
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Chyba při ukládání.");
      }
    } catch {
      setError("Chyba připojení.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    call({ status: newStatus });
  };

  const handleTailorChange = (id: string) => {
    setTailorId(id);
    call({ tailorId: id || null });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { notes };
    const val = parseFloat(price);
    if (price !== "" && !isNaN(val) && val >= 0) {
      payload.price = val;
    }
    call(payload);
  };

  return (
    <div className={styles.actionsCard}>
      <h2 className={styles.cardTitle}>Správa objednávky</h2>

      {saved && <div className={styles.success}>Uloženo.</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Stav */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Stav</p>
        <div className={styles.statusBtns}>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              className={`${styles.statusBtn} ${status === s.value ? styles.statusBtnActive : ""}`}
              onClick={() => handleStatusChange(s.value)}
              disabled={loading || status === s.value}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Přiřazení krejčího */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Přiřazený krejčí</p>
        <div className={styles.field}>
          <select
            value={tailorId}
            onChange={(e) => handleTailorChange(e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            <option value="">— Nepřiřazen —</option>
            {tailors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user.name} ({t.locality})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cena + poznámky */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Cena a poznámky</p>
        <form onSubmit={handlePriceSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Cena (Kč)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
              placeholder="Zadejte cenu"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Interní poznámka (zákazník nevidí)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="Interní poznámka..."
            />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? "Ukládám..." : "Uložit cenu a poznámku"}
          </button>
        </form>
      </div>
    </div>
  );
}
