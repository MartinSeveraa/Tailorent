// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { showOnHomepage: true, isActive: true },
    orderBy: { createdAt: "asc" },
    take: 3,
    select: { id: true, name: true, description: true, icon: true, basePrice: true },
  });

  return <HomeClient services={services} />;
}
