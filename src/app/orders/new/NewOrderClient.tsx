"use client";
// src/app/orders/new/NewOrderClient.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./orderNew.module.scss";

type Service = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  basePrice: number;
  typeKey: string | null;
};

type Step = 1 | 2 | 3;

type FormData = {
  serviceType: string;
  description: string;
  address: string;
  city: string;
  scheduledAt: string;
};

const STEP_LABELS = ["Typ služby", "Místo a čas", "Shrnutí"];

export default function NewOrderClient({ services }: { services: Service[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    serviceType: "",
    description: "",
    address: "",
    city: "",
    scheduledAt: "",
  });

  const selectedService = services.find((s) => s.id === form.serviceType);

  const setField = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canGoNext = (): boolean => {
    if (step === 1) return !!form.serviceType && !!selectedService?.typeKey;
    if (step === 2) return !!form.address && !!form.city && !!form.scheduledAt;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceType: selectedService?.typeKey,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Něco se pokazilo."); return; }
      router.push("/dashboard?ordered=1");
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarLogo}>
          Tailor<span>ent</span>
        </Link>

        {/* Navigation */}
        <div className={styles.sidebarNav}>
          <Link href="/" className={styles.sidebarNavLink}>Domů</Link>
          <Link href="/dashboard" className={styles.sidebarNavLink}>Můj profil</Link>
        </div>

        <div className={styles.sidebarContent}>
          <p className={styles.sidebarLabel}>Nová objednávka</p>
          <h2 className={styles.sidebarTitle}>
            Objednejte<br />krejčího<br /><em>k vám domů</em>
          </h2>
        </div>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div
                key={n}
                className={`${styles.step} ${isActive ? styles.stepActive : ""} ${isDone ? styles.stepDone : ""}`}
              >
                <div className={styles.stepNum}>{isDone ? "✓" : n}</div>
                <span className={styles.stepLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.formWrap}>

          {/* STEP 1: Typ služby */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h1 className={styles.stepTitle}>Vyberte typ služby</h1>
              <p className={styles.stepSub}>Jakou krejčovskou službu potřebujete?</p>

              {services.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
                  Momentálně nejsou k dispozici žádné objednatelné služby.
                </p>
              ) : (
                <div className={styles.serviceGrid}>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setField("serviceType", s.id)}
                      className={`${styles.serviceCard} ${form.serviceType === s.id ? styles.serviceCardActive : ""}`}
                    >
                      <span className={styles.serviceIcon}>{s.icon}</span>
                      <h3 className={styles.serviceTitle}>{s.name}</h3>
                      {s.description && (
                        <p className={styles.serviceDesc}>{s.description}</p>
                      )}
                      {s.basePrice > 0 && (
                        <span className={styles.servicePrice}>od {s.basePrice} Kč</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="description">
                  Popis (volitelné)
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={styles.textarea}
                  placeholder="Popište co potřebujete — např. zkrátit kalhoty o 5 cm, opravit zip na bundě..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Místo a čas */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h1 className={styles.stepTitle}>Místo a termín</h1>
              <p className={styles.stepSub}>Krejčí přijede přímo za vámi.</p>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="address">
                    Ulice a číslo popisné
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className={styles.input}
                    placeholder="Václavské náměstí 1"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="city">
                    Město
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={styles.input}
                    placeholder="Praha"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="scheduledAt">
                  Datum a čas návštěvy
                </label>
                <input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setField("scheduledAt", e.target.value)}
                  className={styles.input}
                  min={new Date(Date.now() + 3_600_000).toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className={styles.infoBox}>
                <span className={styles.infoIcon}>ℹ</span>
                <p>
                  Po potvrzení vám přiřadíme nejbližšího dostupného krejčího ve vaší lokalitě.
                  Potvrzení obdržíte e-mailem.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Shrnutí */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h1 className={styles.stepTitle}>Shrnutí objednávky</h1>
              <p className={styles.stepSub}>Zkontrolujte údaje před odesláním.</p>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Služba</span>
                  <span className={styles.summaryVal}>
                    {selectedService?.icon} {selectedService?.name}
                  </span>
                </div>
                {form.description && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryKey}>Popis</span>
                    <span className={styles.summaryVal}>{form.description}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Adresa</span>
                  <span className={styles.summaryVal}>{form.address}, {form.city}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Termín</span>
                  <span className={styles.summaryVal}>
                    {new Date(form.scheduledAt).toLocaleString("cs-CZ", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                {selectedService && selectedService.basePrice > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryKey}>Orientační cena</span>
                    <span className={`${styles.summaryVal} ${styles.summaryPrice}`}>
                      od {selectedService.basePrice} Kč
                    </span>
                  </div>
                )}
              </div>

              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}

          {/* Navigation bar */}
          <div className={styles.navBar}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className={styles.backBtn}
              >
                ← Zpět
              </button>
            ) : (
              <Link href="/dashboard" className={styles.backBtn}>
                ← Dashboard
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canGoNext()}
                className={styles.nextBtn}
              >
                Pokračovat →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || services.length === 0}
                className={styles.nextBtn}
              >
                {loading ? "Odesílám..." : "Odeslat objednávku"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
