import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import styles from "../admin.module.scss";

export const metadata = { title: "Objednávky — Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      customer: { select: { id: true, name: true, email: true } },
      tailor: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total: await prisma.order.count(),
    pending: await prisma.order.count({ where: { status: "PENDING" } }),
    active: await prisma.order.count({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
    }),
    done: await prisma.order.count({ where: { status: "COMPLETED" } }),
  };

  const STATUSES = [
    { value: "", label: "Vše" },
    { value: "PENDING", label: "Čekající" },
    { value: "CONFIRMED", label: "Potvrzené" },
    { value: "IN_PROGRESS", label: "Probíhající" },
    { value: "COMPLETED", label: "Dokončené" },
    { value: "CANCELLED", label: "Zrušené" },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <p className={styles.pageLabel}>Správa</p>
          <h1 className={styles.pageTitle}>Objednávky</h1>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Celkem</span>
          <strong className={styles.statValue}>{counts.total}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Čekající</span>
          <strong className={styles.statValue}>{counts.pending}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Aktivní</span>
          <strong className={styles.statValue}>{counts.active}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Dokončené</span>
          <strong className={styles.statValue}>{counts.done}</strong>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/orders?status=${s.value}` : "/admin/orders"}
            className={`${styles.statusBtn ?? ""} ${
              (status ?? "") === s.value ? styles.statusBtnActive : ""
            }`}
            style={{
              padding: "6px 14px",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              color:
                (status ?? "") === s.value
                  ? "#c9a84c"
                  : "rgba(255,255,255,0.5)",
              background:
                (status ?? "") === s.value
                  ? "rgba(201,168,76,0.12)"
                  : "transparent",
              borderColor:
                (status ?? "") === s.value
                  ? "rgba(201,168,76,0.3)"
                  : "rgba(255,255,255,0.12)",
            }}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className={styles.empty}>Žádné objednávky.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Zákazník</th>
                <th>Typ služby</th>
                <th>Stav</th>
                <th>Krejčí</th>
                <th>Termín</th>
                <th>Cena</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#fff" }}>
                      {order.customer.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                      {order.customer.email}
                    </div>
                  </td>
                  <td>
                    {SERVICE_TYPE_LABELS[order.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`status_${order.status}`]}`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </td>
                  <td>{order.tailor?.user.name ?? "—"}</td>
                  <td>{formatDate(order.scheduledAt)}</td>
                  <td>
                    {order.price ? formatPrice(Number(order.price)) : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={styles.tableLink}
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
