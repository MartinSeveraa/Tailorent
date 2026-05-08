"use client";

import { useEffect, useRef, useState } from "react";
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

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Nahrávání selhalo.");
  return data.url as string;
}

function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (file: File) => {
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e: any) {
      setUploadError(e.message ?? "Chyba nahrávání.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="náhled"
          style={{ maxHeight: 120, maxWidth: 220, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className={styles.confirmBtn}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ alignSelf: "flex-start" }}
      >
        {uploading ? "Nahrávám…" : value ? "Změnit obrázek" : "Vybrat obrázek"}
      </button>
      {uploadError && <span style={{ color: "red", fontSize: 12 }}>{uploadError}</span>}
    </div>
  );
}

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
    imageUrl: "",
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
        imageUrl: "",
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

                <label className={styles.label}>Obrázek služby</label>
                <ImagePicker
                  value={newService.imageUrl}
                  onChange={(url) => setNewService((prev) => ({ ...prev, imageUrl: url }))}
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

                  <label className={styles.label}>Obrázek služby</label>
                  <ImagePicker
                    value={service.imageUrl}
                    onChange={(url) => setField(service.id, "imageUrl", url)}
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
