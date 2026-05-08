// src/app/admin/services/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditServiceForm from "./EditServiceForm";
import styles from "../../admin.module.scss";

export const metadata = { title: "Upravit službu — Admin" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <main className={styles.main}>
      <Link href="/admin/services" className={styles.backLink}>
        ← Zpět na seznam
      </Link>
      <EditServiceForm
        service={{
          id: service.id,
          name: service.name,
          description: service.description ?? "",
          icon: service.icon,
          basePrice: service.basePrice,
          isActive: service.isActive,
          showOnHomepage: service.showOnHomepage,
          typeKey: service.typeKey,
        }}
      />
    </main>
  );
}
