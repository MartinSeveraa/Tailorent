// prisma/seed.ts
import { PrismaClient, Role, ServiceType, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@krejci-app.cz" },
    update: {},
    create: {
      email: "admin@krejci-app.cz",
      name: "Admin",
      passwordHash: await bcrypt.hash("admin123", 12),
      role: Role.ADMIN,
    },
  });

  // Krejčí
  const tailorUser = await prisma.user.upsert({
    where: { email: "krejci@krejci-app.cz" },
    update: {},
    create: {
      email: "krejci@krejci-app.cz",
      name: "Jana Nováková",
      passwordHash: await bcrypt.hash("krejci123", 12),
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Profesionální krejčí s 15 lety zkušeností. Specializuji se na úpravy obleků a šití na míru.",
          locality: "Praha",
          specializations: [ServiceType.ALTERATION, ServiceType.CUSTOM_SEWING],
          isAvailable: true,
          rating: 4.8,
          reviewCount: 42,
        },
      },
    },
  });

  // Zákazník
  const customer = await prisma.user.upsert({
    where: { email: "zakaznik@example.cz" },
    update: {},
    create: {
      email: "zakaznik@example.cz",
      name: "Petr Svoboda",
      passwordHash: await bcrypt.hash("zakaznik123", 12),
      role: Role.CUSTOMER,
    },
  });

  console.log("✅ Seed dokončen.");
  console.log(`   Admin:    admin@krejci-app.cz / admin123`);
  console.log(`   Krejčí:   krejci@krejci-app.cz / krejci123`);
  console.log(`   Zákazník: zakaznik@example.cz / zakaznik123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
