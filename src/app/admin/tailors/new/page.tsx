"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.scss";

const SPECIALIZATIONS = [
  { value: "ALTERATION", label: "Úpravy oblečení" },
  { value: "CUSTOM_SEWING", label: "Šití na míru" },
  { value: "EXPRESS", label: "Expresní služba" },
];

export default function NewTailorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    locality: "",
    bio: "",
    specializations: [] as string[],
    isAvailable: true,
  });

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

    if (form.specializations.length === 0) {
      setError("Vyberte alespoň jednu specializaci.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tailors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo.");
        return;
      }

      router.push("/admin/tailors");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link href="/admin/tailors" className={styles.backLink}>
        ← Zpět na krejčí
      </Link>

      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Přidat krejčího</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Celé jméno *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={styles.input}
              placeholder="Jana Nováková"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>E-mailová adresa *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={styles.input}
              placeholder="jana@example.cz"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Dočasné heslo * (min. 8 znaků)</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className={styles.input}
              placeholder="Alespoň 8 znaků"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Lokalita (město / region) *</label>
            <input
              type="text"
              required
              value={form.locality}
              onChange={(e) =>
                setForm((f) => ({ ...f, locality: e.target.value }))
              }
              className={styles.input}
              placeholder="Praha"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bio / popis zkušeností</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className={styles.textarea}
              rows={3}
              placeholder="Profesionální krejčí s 10 lety zkušeností..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Specializace * (vyberte alespoň jednu)</label>
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
            {loading ? "Ukládám..." : "Vytvořit krejčího"}
          </button>
        </form>
      </div>
    </>
  );
}
