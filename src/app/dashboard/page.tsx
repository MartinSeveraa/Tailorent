// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNotifications from "./DashboardNotifications";
import styles from "./dashboard.module.scss";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ ordered?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { ordered } = await searchParams;
  const user = session.user as any;
  const role: string = user.role;

  if (role === "ADMIN") redirect("/admin/orders");

  // ── Data fetch ──────────────────────────────────────────────
  const notifications = await (prisma as any).notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  let orders: any[] = [];

  if (role === "CUSTOMER") {
    orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: { tailor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
  } else if (role === "TAILOR") {
    orders = await prisma.order.findMany({
      where: { tailor: { userId: user.id } },
      include: { customer: true },
      orderBy: { scheduledAt: "asc" },
    });
  }

  const statusCount = {
    active: orders.filter((o) =>
      ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(o.status)
    ).length,
    done: orders.filter((o) => o.status === "COMPLETED").length,
    total: orders.length,
  };

  const isCustomer = role === "CUSTOMER";
  const isTailor = role === "TAILOR";

  return (
    <div className={styles.page}>
      {/* ── Sidebar ── */}
      <DashboardSidebar userName={user.name} isCustomer={isCustomer} />

      {/* ── Main ── */}
      <main className={styles.main}>
        {/* Success banner */}
        {ordered === "1" && (
          <div className={styles.successBanner}>
            Objednávka byla úspěšně odeslána. Brzy vás kontaktujeme s potvrzením.
          </div>
        )}

        {/* Header */}
        <div className={styles.topBar}>
          <div>
            <p className={styles.topBarLabel}>
              {isCustomer ? "Zákaznický přehled" : "Přehled zakázek"}
            </p>
            <h1 className={styles.topBarTitle}>
              Dobrý den, {user.name?.split(" ")[0]}
            </h1>
          </div>
          {isCustomer && (
            <Link href="/orders/new" className={styles.newOrderBtn}>
              + Nová objednávka
            </Link>
          )}
        </div>

        {/* Notifikace */}
        <DashboardNotifications initial={notifications} />

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Celkem objednávek</span>
            <strong className={styles.statValue}>{statusCount.total}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Aktivních</span>
            <strong className={styles.statValue}>{statusCount.active}</strong>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Dokončených</span>
            <strong className={styles.statValue}>{statusCount.done}</strong>
          </div>
        </div>

        {/* Orders */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {isCustomer ? "Moje objednávky" : "Přiřazené zakázky"}
          </h2>

          {orders.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>
                {isCustomer
                  ? "Zatím žádné objednávky."
                  : "Zatím žádné přiřazené zakázky."}
              </p>
              {isCustomer && (
                <Link href="/orders/new" className={styles.emptyBtn}>
                  Vytvořit první objednávku
                </Link>
              )}
            </div>
          ) : (
            <div className={styles.orderList}>
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className={styles.orderCard}
                >
                  <div className={styles.orderCardLeft}>
                    <span
                      className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                    <h3 className={styles.orderService}>
                      {SERVICE_TYPE_LABELS[order.serviceType as keyof typeof SERVICE_TYPE_LABELS]}
                    </h3>
                    <p className={styles.orderMeta}>
                      {order.address}, {order.city}
                    </p>
                    {isCustomer && order.tailor && (
                      <p className={styles.orderMeta}>
                        Krejčí: {order.tailor.user.name}
                      </p>
                    )}
                    {isTailor && order.customer && (
                      <p className={styles.orderMeta}>
                        Zákazník: {order.customer.name}
                      </p>
                    )}
                  </div>
                  <div className={styles.orderCardRight}>
                    <span className={styles.orderDate}>
                      {formatDate(order.scheduledAt)}
                    </span>
                    {order.price && (
                      <span className={styles.orderPrice}>
                        {formatPrice(Number(order.price))}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
