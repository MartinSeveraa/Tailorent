import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  message: string,
  link?: string
) {
  await (prisma as any).notification.create({
    data: { userId, message, link: link ?? null },
  });
}
