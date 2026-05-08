import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TailorItem from "./TailorItem";
import styles from "../admin.module.scss";

export const metadata = { title: "Krejčí — Admin" };

export default async function AdminTailorsPage() {
  const tailors = await prisma.tailorProfile.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { locality: "asc" },
  });

  const available = tailors.filter((t) => t.isAvailable).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <p className={styles.pageLabel}>Správa</p>
          <h1 className={styles.pageTitle}>Krejčí</h1>
        </div>
        <Link href="/admin/tailors/new" className={styles.addBtn}>
          + Přidat krejčího
        </Link>
      </div>

      {/* Stats */}
      <div
        className={styles.statsRow}
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Celkem krejčích</span>
          <strong className={styles.statValue}>{tailors.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Dostupných</span>
          <strong className={styles.statValue}>{available}</strong>
        </div>
      </div>

      {tailors.length === 0 ? (
        <div className={styles.empty}>
          Zatím žádní krejčí.{" "}
          <Link href="/admin/tailors/new" style={{ color: "#c9a84c" }}>
            Přidat prvního krejčího
          </Link>
        </div>
      ) : (
        <div>
          {tailors.map((t) => (
            <TailorItem
              key={t.id}
              tailor={{
                id: t.id,
                locality: t.locality,
                specializations: t.specializations as string[],
                isAvailable: t.isAvailable,
                rating: t.rating,
                reviewCount: t.reviewCount,
                user: { name: t.user.name, email: t.user.email },
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
