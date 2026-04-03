"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.scss";

type ServiceType = "ALTERATION" | "CUSTOM_SEWING" | "EXPRESS";
type ServiceItem = {
  id: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  priceFrom: number;
  imageUrl: string;
  isActive: boolean;
};

export function AdminServicesManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [newService, setNewService] = useState<Omit<ServiceItem, "id">>({
    serviceType: "ALTERATION",
    title: "",
    description: "",
    priceFrom: 200,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop",
    isActive: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Nepodařilo se načíst služby.");
          return;
        }
        setServices(data.data ?? []);
      } catch {
        setError("Chyba při načítání služeb.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setField = <K extends keyof ServiceItem>(
    id: string,
    key: K,
    value: ServiceItem[K]
  ) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const saveService = async (service: ServiceItem) => {
    setSavingId(service.id);
    setError("");
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: service.serviceType,
          title: service.title,
          description: service.description,
          priceFrom: Number(service.priceFrom),
          imageUrl: service.imageUrl,
          isActive: service.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se uložit službu.");
      }
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setSavingId(null);
    }
  };

  const addService = async () => {
    setError("");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se přidat službu.");
        return;
      }
      setServices((prev) => [...prev, data.data]);
      setNewService({
        serviceType: "ALTERATION",
        title: "",
        description: "",
        priceFrom: 200,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&fit=crop",
        isActive: true,
      });
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    }
  };

  const deleteService = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nepodařilo se smazat službu.");
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Chyba připojení. Zkuste to znovu.");
    }
  };

  return (
    <div className={styles.adminSection}>
      <h3 className={styles.sectionTitle}>Služby</h3>
      {loading ? (
        <p className={styles.emptyText}>Načítám služby…</p>
      ) : (
        <>
          <div className={`${styles.orderCard} ${styles.addServiceCard}`}>
            <div className={styles.orderCardLeft}>
              <span className={styles.addServiceBadge}>Nová služba</span>
              <div className={styles.adminFields}>
                <label className={styles.label}>Typ služby</label>
                <select
                  className={styles.textarea}
                  value={newService.serviceType}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, serviceType: e.target.value as ServiceType }))
                  }
                >
                  <option value="ALTERATION">Úprava oblečení</option>
                  <option value="CUSTOM_SEWING">Šití na míru</option>
                  <option value="EXPRESS">Expresní služba</option>
                </select>

                <label className={styles.label}>Název služby</label>
                <input
                  className={styles.textarea}
                  value={newService.title}
                  onChange={(e) => setNewService((prev) => ({ ...prev, title: e.target.value }))}
                />

                <label className={styles.label}>Popis</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={newService.description}
                  onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                />

                <label className={styles.label}>Cena od (Kč)</label>
                <input
                  className={styles.textarea}
                  type="number"
                  min={1}
                  value={newService.priceFrom}
                  onChange={(e) => setNewService((prev) => ({ ...prev, priceFrom: Number(e.target.value || 0) }))}
                />

                <label className={styles.label}>URL obrázku</label>
                <input
                  className={styles.textarea}
                  value={newService.imageUrl}
                  onChange={(e) => setNewService((prev) => ({ ...prev, imageUrl: e.target.value }))}
                />
              </div>
              <div className={styles.adminActions}>
                <button type="button" className={styles.confirmBtn} onClick={addService}>
                  Přidat službu
                </button>
              </div>
            </div>
          </div>

          <div className={styles.orderList}>
          {services.map((service) => (
            <div key={service.id} className={styles.orderCard}>
              <div className={styles.orderCardLeft}>
                <span className={styles.statusBadge}>{service.serviceType}</span>
                <div className={styles.adminFields}>
                  <label className={styles.label}>Název služby</label>
                  <input
                    className={styles.textarea}
                    value={service.title}
                    onChange={(e) => setField(service.id, "title", e.target.value)}
                  />

                  <label className={styles.label}>Popis</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={service.description}
                    onChange={(e) => setField(service.id, "description", e.target.value)}
                  />

                  <label className={styles.label}>Cena od (Kč)</label>
                  <input
                    className={styles.textarea}
                    type="number"
                    min={1}
                    value={service.priceFrom}
                    onChange={(e) => setField(service.id, "priceFrom", Number(e.target.value || 0))}
                  />

                  <label className={styles.label}>URL obrázku</label>
                  <input
                    className={styles.textarea}
                    value={service.imageUrl}
                    onChange={(e) => setField(service.id, "imageUrl", e.target.value)}
                  />

                  <label className={styles.label}>
                    <input
                      type="checkbox"
                      checked={service.isActive}
                      onChange={(e) => setField(service.id, "isActive", e.target.checked)}
                    />{" "}
                    Aktivní služba
                  </label>
                </div>
                <div className={styles.adminActions}>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => saveService(service)}
                    disabled={savingId === service.id}
                  >
                    {savingId === service.id ? "Ukládám..." : "Uložit službu"}
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => deleteService(service.id)}
                  >
                    Smazat službu
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

