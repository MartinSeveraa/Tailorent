// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { formatDate, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SERVICE_TYPE_LABELS } from "@/types";
import DashboardSidebar from "./DashboardSidebar";
=======
import { TailorRequests } from "./TailorRequests";
import { LogoutButton } from "./LogoutButton";
import { AdminOrdersManager } from "./AdminOrdersManager";
import { CustomerOrderList } from "./CustomerOrderList";
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
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
<<<<<<< HEAD
  const role: string = user.role;

  if (role === "ADMIN") redirect("/admin/orders");

  // ── Data fetch ──────────────────────────────────────────────
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
=======
  const isCustomer = user.role === "CUSTOMER";
  const isTailor = user.role === "TAILOR";
  const isAdmin = user.role === "ADMIN";

  // ── Data fetch ──────────────────────────────────────────────
  const orders = isCustomer
    ? await prisma.order.findMany({
        where: { customerId: user.id },
        include: { tailor: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      })
    : isTailor
    ? await prisma.order.findMany({
        where: {
          tailor: { userId: user.id },
        },
        include: { customer: true },
        orderBy: { scheduledAt: "asc" },
      })
    : await prisma.order.findMany({
        include: {
          customer: true,
          tailor: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a

  // IDs objednávek zákazníka, které již mají recenzi
  const reviewedOrderIds: Set<string> = isCustomer
    ? new Set(
        (
          await (prisma as any).review.findMany({
            where: { customerId: user.id },
            select: { orderId: true },
          })
        ).map((r: any) => r.orderId)
      )
    : new Set();

  const tailors = isAdmin
    ? await prisma.tailorProfile.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { user: { name: "asc" } },
      })
    : [];

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
<<<<<<< HEAD
      <DashboardSidebar userName={user.name} isCustomer={isCustomer} />
=======
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/">Tailor<span>ent</span></Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/dashboard" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <span className={styles.sidebarIcon}>◈</span>
            Dashboard
          </Link>
          {isAdmin && (
            <Link href="/dashboard/services" className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>⚙</span>
              Služby
            </Link>
          )}
          {isCustomer && (
            <Link href="/orders/new" className={styles.sidebarLink}>
              <span className={styles.sidebarIcon}>＋</span>
              Nová objednávka
            </Link>
          )}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.sidebarUserInfo}>
            <strong>{user.name}</strong>
            <span>{isCustomer ? "Zákazník" : "Krejčí"}</span>
          </div>
        </div>
        <div className={styles.sidebarLogout}>
          <LogoutButton />
        </div>
      </aside>
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a

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
              {isCustomer
                ? "Zákaznický přehled"
                : isTailor
                ? "Přehled zakázek"
                : "Admin přehled"}
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
            {isCustomer ? "Moje objednávky" : isTailor ? "Přiřazené zakázky" : "Všechny objednávky"}
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
          ) : isCustomer ? (
            <CustomerOrderList
              orders={orders.map((order) => ({
                id: order.id,
                status: order.status as any,
                serviceType: order.serviceType as any,
                address: order.address,
                city: order.city,
                scheduledAt: order.scheduledAt,
                price: order.price ? Number(order.price) : null,
                tailorId: order.tailorId,
                tailorName: (order as any).tailor?.user?.name ?? null,
                hasReview: reviewedOrderIds.has(order.id),
              }))}
            />
          ) : isTailor ? (
            <TailorRequests
              orders={orders.map((order) => ({
                id: order.id,
                status: order.status as any,
                serviceType: order.serviceType as any,
                description: order.description,
                address: order.address,
                city: order.city,
                scheduledAt: order.scheduledAt,
                notes: order.notes,
                customer: (order as any).customer
                  ? {
                      name: (order as any).customer.name,
                      email: (order as any).customer.email,
                    }
                  : null,
              }))}
            />
          ) : (
<<<<<<< HEAD
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
=======
            <AdminOrdersManager
              orders={orders.map((order) => ({
                id: order.id,
                status: order.status as any,
                serviceType: order.serviceType as any,
                description: order.description,
                address: order.address,
                city: order.city,
                scheduledAt: order.scheduledAt,
                notes: order.notes,
                price: order.price ? Number(order.price) : null,
                tailorId: order.tailorId,
                customer: (order as any).customer
                  ? {
                      name: (order as any).customer.name,
                      email: (order as any).customer.email,
                    }
                  : null,
                tailor: (order as any).tailor
                  ? {
                      user: {
                        name: (order as any).tailor.user?.name,
                        email: (order as any).tailor.user?.email,
                      },
                    }
                  : null,
              }))}
              tailors={tailors.map((tailor) => ({
                id: tailor.id,
                name: tailor.user.name,
                email: tailor.user.email,
                locality: tailor.locality,
              }))}
            />
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
          )}
        </div>
      </main>
    </div>
  );
}
