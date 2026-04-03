"use client";
// src/app/orders/new/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./orderNew.module.scss";

type Step = 1 | 2 | 3;

type FormData = {
  serviceType: string;
  description: string;
  address: string;
  city: string;
  scheduledAt: string;
};

const SERVICES = [
  {
    id: "ALTERATION",
    icon: "✂",
    title: "Úpravy oblečení",
    desc: "Zkrácení, zúžení, přešití zipů a opravy",
    price: "od 200 Kč",
  },
  {
    id: "CUSTOM_SEWING",
    icon: "◈",
    title: "Šití na míru",
    desc: "Obleky, šaty, košile — přesně podle vašich měr",
    price: "od 1 500 Kč",
  },
  {
    id: "EXPRESS",
    icon: "⚡",
    title: "Expresní služba",
    desc: "Výjezd v den objednávky, oprava do 24 hodin",
    price: "od 500 Kč",
  },
];

const STEP_LABELS = ["Typ služby", "Místo a čas", "Shrnutí"];

export default function NewOrderPage() {
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

  const selectedService = SERVICES.find((s) => s.id === form.serviceType);

  // ── Helpers ──────────────────────────────────────────────────
  const setField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const canGoNext = (): boolean => {
    if (step === 1) return !!form.serviceType;
    if (step === 2) return !!form.address && !!form.city && !!form.scheduledAt;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
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
          scheduledAt: new Date(form.scheduledAt).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo.");
        return;
      }

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
        <Link href="/dashboard" className={styles.sidebarLogo}>
          Tailor<span>ent</span>
        </Link>

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
                <div className={styles.stepNum}>
                  {isDone ? "✓" : n}
                </div>
                <span className={styles.stepLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={styles.main}>
        <div className={styles.formWrap}>

          {/* ── STEP 1: Typ služby ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h1 className={styles.stepTitle}>Vyberte typ služby</h1>
              <p className={styles.stepSub}>Jakou krejčovskou službu potřebujete?</p>

              <div className={styles.serviceGrid}>
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setField("serviceType", s.id)}
                    className={`${styles.serviceCard} ${form.serviceType === s.id ? styles.serviceCardActive : ""}`}
                  >
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <h3 className={styles.serviceTitle}>{s.title}</h3>
                    <p className={styles.serviceDesc}>{s.desc}</p>
                    <span className={styles.servicePrice}>{s.price}</span>
                  </button>
                ))}
              </div>

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

          {/* ── STEP 2: Místo a čas ── */}
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
                  min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
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

          {/* ── STEP 3: Shrnutí ── */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h1 className={styles.stepTitle}>Shrnutí objednávky</h1>
              <p className={styles.stepSub}>Zkontrolujte údaje před odesláním.</p>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Služba</span>
                  <span className={styles.summaryVal}>
                    {selectedService?.icon} {selectedService?.title}
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
                  <span className={styles.summaryVal}>
                    {form.address}, {form.city}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Termín</span>
                  <span className={styles.summaryVal}>
                    {new Date(form.scheduledAt).toLocaleString("cs-CZ", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Orientační cena</span>
                  <span className={`${styles.summaryVal} ${styles.summaryPrice}`}>
                    {selectedService?.price}
                  </span>
                </div>
              </div>

              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className={styles.navBar}>
            {step > 1 ? (
              <button type="button" onClick={handleBack} className={styles.backBtn}>
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
                onClick={handleNext}
                disabled={!canGoNext()}
                className={styles.nextBtn}
              >
                Pokračovat →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
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
