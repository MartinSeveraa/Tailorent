import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditTailorForm from "./EditTailorForm";
import styles from "../../admin.module.scss";

export const metadata = { title: "Upravit krejčího — Admin" };

export default async function EditTailorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tailor = await prisma.tailorProfile.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!tailor) notFound();

  return (
    <>
      <Link href="/admin/tailors" className={styles.backLink}>
        ← Zpět na krejčí
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <p className={styles.pageLabel}>Krejčí</p>
          <h1 className={styles.pageTitle}>{tailor.user.name}</h1>
        </div>
      </div>

      <EditTailorForm
        tailor={{
          id: tailor.id,
          name: tailor.user.name,
          email: tailor.user.email,
          locality: tailor.locality,
          specializations: tailor.specializations as string[],
          bio: tailor.bio ?? "",
          isAvailable: tailor.isAvailable,
        }}
      />
    </>
  );
}
