// src/app/orders/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewOrderClient from "./NewOrderClient";

export const metadata = { title: "Nová objednávka" };

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (user.role === "ADMIN") redirect("/admin/orders");
  if (user.role === "TAILOR") redirect("/dashboard");

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, description: true, icon: true, basePrice: true, typeKey: true },
  });

  return <NewOrderClient services={services as any} />;
}
