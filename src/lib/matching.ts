import { prisma } from "@/lib/prisma";
import { ServiceType } from "@prisma/client";

export async function findMatchingTailor(
  city: string,
  serviceType: ServiceType
): Promise<string | null> {
  const tailor = await prisma.tailorProfile.findFirst({
    where: {
      locality: { equals: city, mode: "insensitive" },
      isAvailable: true,
      specializations: { has: serviceType },
    },
    orderBy: { rating: "desc" },
  });
  return tailor?.id ?? null;
}
