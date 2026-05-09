import { prisma } from "@/lib/prisma";
import { ServiceType } from "@prisma/client";

export async function findMatchingTailor(
  city: string,
  serviceType: ServiceType,
  scheduledAt: Date
): Promise<string | null> {
  const window = 2 * 60 * 60 * 1000; // ±2 hodiny

  const tailor = await prisma.tailorProfile.findFirst({
    where: {
      locality: { equals: city, mode: "insensitive" },
      isAvailable: true,
      specializations: { has: serviceType },
      // Žádná kolizní zakázka ve stejném časovém okně
      orders: {
        none: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - window),
            lte: new Date(scheduledAt.getTime() + window),
          },
        },
      },
    },
    orderBy: { rating: "desc" },
  });

  return tailor?.id ?? null;
}
