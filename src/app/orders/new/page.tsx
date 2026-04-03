"use client";
// src/app/orders/new/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./orderNew.module.scss";

type Step = 1 | 2 | 3;

type FormData = {
  serviceId: string;
  serviceType: string;
  description: string;
  address: string;
  city: string;
  scheduledAt: string;
  tailorId: string;
};

type Tailor = {
  id: string;
  name: string;
  email: string;
  tailorProfile?: {
    locality: string;
    rating: number;
    reviewCount: number;
  } | null;
};

type CatalogService = {
  id: string;
  serviceType: "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";
  title: string;
  description: string;
  priceFrom: number;
  imageUrl: string;
  isActive: boolean;
};

const FALLBACK_SERVICES: CatalogService[] = [
  {
    id: "service_alteration",
    serviceType: "ALTERATION",
    title: "Úpravy oblečení",
    description: "Zkrácení, zúžení, přešití zipů a opravy",
    priceFrom: 200,
    imageUrl: "",
    isActive: true,
  },
  {
    id: "service_custom_sewing",
    serviceType: "CUSTOM_SEWING",
    title: "Šití na míru",
    description: "Obleky, šaty, košile — přesně podle vašich měr",
    priceFrom: 1500,
    imageUrl: "",
    isActive: true,
  },
  {
    id: "service_express",
    serviceType: "EXPRESS",
    title: "Expresní služba",
    description: "Výjezd v den objednávky, oprava do 24 hodin",
    priceFrom: 500,
    imageUrl: "",
    isActive: true,
  },
];

const STEP_LABELS = ["Typ služby", "Místo a čas", "Shrnutí"];

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [services, setServices] = useState<CatalogService[]>(FALLBACK_SERVICES);
  const [tailorsLoading, setTailorsLoading] = useState(false);
  const [tailorsError, setTailorsError] = useState("");

  const [form, setForm] = useState<FormData>({
    serviceId: "",
    serviceType: "",
    description: "",
    address: "",
    city: "",
    scheduledAt: "",
    tailorId: "",
  });

  const selectedService = services.find((s) => s.id === form.serviceId);
  const selectedTailor = tailors.find((t) => t.id === form.tailorId);

  // ── Helpers ──────────────────────────────────────────────────
  const setField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const canGoNext = (): boolean => {
    if (step === 1) return !!form.serviceId;
    if (step === 2) return !!form.address && !!form.city && !!form.scheduledAt;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  // Načtení seznamu krejčích (users s rolí TAILOR)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTailorsLoading(true);
      setTailorsError("");
      try {
        const res = await fetch("/api/tailors");
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setTailorsError(data.error ?? "Nepodařilo se načíst seznam krejčích.");
          return;
        }
        if (!cancelled) setTailors(data.data ?? []);
      } catch {
        if (!cancelled) setTailorsError("Chyba při načítání seznamu krejčích.");
      } finally {
        if (!cancelled) setTailorsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!res.ok) return;
        const active = (data.data ?? []).filter((s: CatalogService) => s.isActive);
        if (!cancelled && active.length > 0) setServices(active);
      } catch {
        // fallback services
      }
    };
    loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceType: selectedService?.serviceType ?? "CUSTOM_SEWING",
          description: selectedService
            ? `${selectedService.title}${form.description ? ` — ${form.description}` : ""}`
            : form.description,
          tailorId: form.tailorId || undefined,
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
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setField("serviceId", s.id);
                      setField("serviceType", s.serviceType);
                    }}
                    className={`${styles.serviceCard} ${form.serviceId === s.id ? styles.serviceCardActive : ""}`}
                  >
                    <h3 className={styles.serviceTitle}>{s.title}</h3>
                    <p className={styles.serviceDesc}>{s.description}</p>
                    <span className={styles.servicePrice}>od {s.priceFrom} Kč</span>
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

              <div className={styles.field}>
                <label className={styles.label} htmlFor="tailor">
                  Konkrétní krejčí (volitelné)
                </label>
                <select
                  id="tailor"
                  className={styles.input}
                  value={form.tailorId}
                  onChange={(e) => setField("tailorId", e.target.value)}
                  disabled={tailorsLoading || !!tailorsError || tailors.length === 0}
                >
                  <option value="">Nechat vybrat podle lokality</option>
                  {tailors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.tailorProfile?.locality ? ` — ${t.tailorProfile.locality}` : ""}
                      {typeof t.tailorProfile?.rating === "number" &&
                      t.tailorProfile.reviewCount > 0
                        ? ` (${t.tailorProfile.rating.toFixed(1)}★, ${t.tailorProfile.reviewCount} hodnocení)`
                        : ""}
                    </option>
                  ))}
                </select>
                {tailorsLoading && (
                  <span className={styles.helperText}>Načítám seznam krejčích…</span>
                )}
                {tailorsError && (
                  <span className={styles.helperText}>{tailorsError}</span>
                )}
              </div>

              <div className={styles.infoBox}>
                <span className={styles.infoIcon}>ℹ</span>
                <p>
                  Po potvrzení vám přiřadíme nejbližšího dostupného krejčího ve vaší lokalitě.
                  Pokud zvolíte konkrétního krejčího, budeme se prioritně snažit přiřadit jeho.
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
                    {selectedService?.title}
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
                  <span className={styles.summaryKey}>Krejčí</span>
                  <span className={styles.summaryVal}>
                    {selectedTailor
                      ? `${selectedTailor.name}${
                          selectedTailor.tailorProfile?.locality
                            ? ` — ${selectedTailor.tailorProfile.locality}`
                            : ""
                        }`
                      : "Nechat vybrat automaticky"}
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
                    {selectedService ? `od ${selectedService.priceFrom} Kč` : "—"}
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
