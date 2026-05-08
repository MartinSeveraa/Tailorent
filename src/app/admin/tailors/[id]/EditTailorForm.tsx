"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.scss";

const SPECIALIZATIONS = [
  { value: "ALTERATION", label: "Úpravy oblečení" },
  { value: "CUSTOM_SEWING", label: "Šití na míru" },
  { value: "EXPRESS", label: "Expresní služba" },
];

type Props = {
  tailor: {
    id: string;
    name: string;
    email: string;
    locality: string;
    specializations: string[];
    bio: string;
    isAvailable: boolean;
  };
};

export default function EditTailorForm({ tailor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...tailor });

  const toggleSpec = (value: string) => {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(value)
        ? f.specializations.filter((s) => s !== value)
        : [...f.specializations, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (form.specializations.length === 0) {
      setError("Vyberte alespoň jednu specializaci.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tailors/${tailor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          locality: form.locality,
          specializations: form.specializations,
          bio: form.bio,
          isAvailable: form.isAvailable,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Chyba při ukládání.");
        return;
      }

      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      {error && <div className={styles.error}>{error}</div>}
      {saved && <div className={styles.success}>Uloženo.</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Celé jméno *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>E-mail (pouze pro zobrazení)</label>
          <input
            type="email"
            value={form.email}
            disabled
            className={styles.input}
            style={{ opacity: 0.4 }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Lokalita *</label>
          <input
            type="text"
            required
            value={form.locality}
            onChange={(e) =>
              setForm((f) => ({ ...f, locality: e.target.value }))
            }
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Bio / popis zkušeností</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Specializace *</label>
          <div className={styles.checkboxGroup}>
            {SPECIALIZATIONS.map((s) => (
              <label key={s.value} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.specializations.includes(s.value)}
                  onChange={() => toggleSpec(s.value)}
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm((f) => ({ ...f, isAvailable: e.target.checked }))
              }
            />
            Dostupný (přijímá nové zakázky)
          </label>
        </div>

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={loading}
          style={{ marginTop: "8px" }}
        >
          {loading ? "Ukládám..." : "Uložit změny"}
        </button>
      </form>
    </div>
  );
}
