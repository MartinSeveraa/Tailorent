import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import styles from "./admin.module.scss";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className={styles.layout}>
      <AdminSidebar userName={user.name ?? "Admin"} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
