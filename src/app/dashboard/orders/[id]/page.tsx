// src/app/dashboard/orders/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import DashboardSidebar from "../../DashboardSidebar";
import OrderDetailActions from "./OrderDetailActions";
import styles from "./orderDetail.module.scss";

export const metadata = { title: "Detail objednávky" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const role: string = user.role;

  if (role === "ADMIN") redirect(`/admin/orders/${id}`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      tailor: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      review: { select: { rating: true } },
    },
  });

  if (!order) notFound();

  const isOwner =
    (role === "CUSTOMER" && order.customerId === user.id) ||
    (role === "TAILOR" && order.tailor?.userId === user.id);

  if (!isOwner) notFound();

  const isCustomer = role === "CUSTOMER";

  return (
    <div className={styles.page}>
      <DashboardSidebar userName={user.name} isCustomer={isCustomer} />

      <main className={styles.main}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Zpět na dashboard
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

              {isCustomer ? (
                <>
                  <dt>Krejčí</dt>
                  <dd>{order.tailor?.user.name ?? "Nepřiřazen"}</dd>
                </>
              ) : (
                <>
                  <dt>Zákazník</dt>
                  <dd>
                    {order.customer.name}{" "}
                    <span>({order.customer.email})</span>
                  </dd>
                </>
              )}

              <dt>Cena</dt>
              <dd>
                {order.price
                  ? `${Number(order.price).toLocaleString("cs-CZ")} Kč`
                  : "—"}
              </dd>
            </dl>
          </div>

          {/* Akce */}
          <OrderDetailActions
            orderId={order.id}
            status={order.status}
            role={role}
            existingRating={order.review?.rating ?? null}
          />
        </div>
      </main>
    </div>
  );
}
