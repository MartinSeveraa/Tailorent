import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import AdminOrderDetail from "./AdminOrderDetail";
import styles from "../../admin.module.scss";

export const metadata = { title: "Detail objednávky — Admin" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, tailors] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        tailor: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.tailorProfile.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { locality: "asc" },
    }),
  ]);

  if (!order) notFound();

  return (
    <>
      <Link href="/admin/orders" className={styles.backLink}>
        ← Zpět na objednávky
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <p className={styles.pageLabel}>Objednávka</p>
          <h1 className={styles.pageTitle}>
            {SERVICE_TYPE_LABELS[order.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
          </h1>
        </div>
        <span className={`${styles.badge} ${styles[`status_${order.status}`]}`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      <div className={styles.detailGrid}>
        {/* Informace */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>Informace</h2>
          <dl className={styles.dl}>
            <dt>Zákazník</dt>
            <dd>
              {order.customer.name}{" "}
              <span>({order.customer.email})</span>
            </dd>

            <dt>Typ služby</dt>
            <dd>
              {SERVICE_TYPE_LABELS[order.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
            </dd>

            <dt>Popis</dt>
            <dd>{order.description || "—"}</dd>

            <dt>Adresa</dt>
            <dd>
              {order.address}, {order.city}
            </dd>

            <dt>Termín</dt>
            <dd>{formatDateTime(order.scheduledAt)}</dd>

            <dt>Vytvořeno</dt>
            <dd>{formatDateTime(order.createdAt)}</dd>

            <dt>Krejčí</dt>
            <dd>{order.tailor?.user.name ?? "Nepřiřazen"}</dd>

            <dt>Cena</dt>
            <dd>
              {order.price
                ? `${Number(order.price).toLocaleString("cs-CZ")} Kč`
                : "—"}
            </dd>

            {order.notes && (
              <>
                <dt>Interní poznámka</dt>
                <dd>{order.notes}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Správa */}
        <AdminOrderDetail
          order={{
            id: order.id,
            status: order.status,
            price: order.price ? Number(order.price) : null,
            notes: order.notes,
            tailorId: order.tailorId,
          }}
          tailors={tailors.map((t) => ({
            id: t.id,
            locality: t.locality,
            user: { name: t.user.name },
          }))}
        />
      </div>
    </>
  );
}
