// src/app/admin/services/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ServiceItem from "./ServiceItem";
import styles from "../admin.module.scss";

export const metadata = { title: "Správa služeb — Admin" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  const active        = services.filter((s) => s.isActive).length;
  const homepageCount = services.filter((s) => s.showOnHomepage).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <p className={styles.pageLabel}>Správa</p>
          <h1 className={styles.pageTitle}>Správa služeb</h1>
        </div>
        <Link href="/admin/services/new" className={styles.addBtn}>
          + Přidat službu
        </Link>
      </div>

      <div className={styles.statsRow} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Celkem služeb</span>
          <strong className={styles.statValue}>{services.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Aktivních</span>
          <strong className={styles.statValue}>{active}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Na homepage</span>
          <strong className={styles.statValue}>{homepageCount} / 3</strong>
        </div>
      </div>

      {services.length === 0 ? (
        <div className={styles.empty}>
          Zatím žádné služby.{" "}
          <Link href="/admin/services/new" style={{ color: "#c9a84c" }}>
            Přidat první službu
          </Link>
        </div>
      ) : (
        <div>
          {services.map((s) => (
            <ServiceItem
              key={s.id}
              homepageCount={homepageCount}
              service={{
                id: s.id,
                name: s.name,
                description: s.description ?? "",
                icon: s.icon,
                basePrice: s.basePrice,
                isActive: s.isActive,
                showOnHomepage: s.showOnHomepage,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
