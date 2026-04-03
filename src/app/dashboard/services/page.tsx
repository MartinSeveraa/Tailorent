import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "../LogoutButton";
import { AdminServicesManager } from "../AdminServicesManager";
import styles from "../dashboard.module.scss";

export const metadata = { title: "Správa služeb" };

export default async function DashboardServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Link href="/">Tailor<span>ent</span></Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/dashboard" className={styles.sidebarLink}>
            <span className={styles.sidebarIcon}>◈</span>
            Dashboard
          </Link>
          <Link href="/dashboard/services" className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <span className={styles.sidebarIcon}>⚙</span>
            Služby
          </Link>
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className={styles.sidebarUserInfo}>
            <strong>{user.name}</strong>
            <span>Admin</span>
          </div>
        </div>

        <div className={styles.sidebarLogout}>
          <LogoutButton />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <p className={styles.topBarLabel}>Admin přehled</p>
            <h1 className={styles.topBarTitle}>Správa služeb</h1>
          </div>
        </div>

        <div className={styles.section}>
          <AdminServicesManager />
        </div>
      </main>
    </div>
  );
}

