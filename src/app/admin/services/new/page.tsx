"use client";
// src/app/admin/services/new/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.scss";

export default function NewServicePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "✂",
    basePrice: "",
    isActive: true,
    showOnHomepage: false,
    typeKey: "" as string,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basePrice: Number(form.basePrice) || 0,
          typeKey: form.typeKey || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Chyba při ukládání"); return; }
      router.push("/admin/services");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Link href="/admin/services" className={styles.backLink}>
        ← Zpět na seznam
      </Link>

      <div className={styles.formCard}>
        <h1 className={styles.formTitle}>Nová služba</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={submit}>
          <div className={styles.field}>
            <label className={styles.label}>Název *</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="např. Úprava oblečení"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Popis</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Krátký popis služby..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ikona (emoji nebo symbol)</label>
            <input
              className={styles.input}
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              placeholder="✂"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Typ objednávky</label>
            <select
              className={styles.select}
              value={form.typeKey}
              onChange={(e) => set("typeKey", e.target.value)}
            >
              <option value="">— Nekategorizováno (nelze objednat) —</option>
              <option value="ALTERATION">Úpravy oblečení</option>
              <option value="CUSTOM_SEWING">Šití na míru</option>
              <option value="EXPRESS">Expresní služba</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Základní cena (Kč)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              Aktivní (viditelná pro zákazníky)
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.showOnHomepage}
                onChange={(e) => set("showOnHomepage", e.target.checked)}
              />
              Zobrazit na homepage (max. 3 služby)
            </label>
          </div>

          <button type="submit" disabled={loading} className={styles.saveBtn}>
            {loading ? "Ukládám…" : "Vytvořit službu"}
          </button>
        </form>
      </div>
    </main>
  );
}
