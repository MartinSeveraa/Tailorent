// prisma/seed.ts
import { PrismaClient, Role, ServiceType, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ago  = (days: number) => new Date(Date.now() - days * 86_400_000);
const from = (days: number) => new Date(Date.now() + days * 86_400_000);

async function main() {
  console.log("🌱 Seeding database…");

  // ── 1. CLEAN UP (FK order) ───────────────────────────────────────
  await prisma.order.deleteMany();
  await prisma.tailorProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✓ Stará data smazána");

  // ── 2. SERVICES (catalog) ────────────────────────────────────────
  await prisma.service.createMany({
    data: [
      {
        name: "Úprava oblečení",
        description:
          "Zkrácení kalhot a sukní, zúžení či rozšíření, přešití zipů a knoflíků, opravy poškozených míst.",
        icon: "✂",
        basePrice: 200,
        isActive: true,
        showOnHomepage: true,
        typeKey: "ALTERATION",
      },
      {
        name: "Šití na míru",
        description:
          "Pánské a dámské obleky, společenské šaty, košile a saka, svatební kolekce — vše přesně na vaše míry.",
        icon: "◈",
        basePrice: 1500,
        isActive: true,
        showOnHomepage: true,
        typeKey: "CUSTOM_SEWING",
      },
      {
        name: "Expresní služby",
        description:
          "Výjezd v den objednávky, oprava do 24 hodin, urgentní alternace a záchrana před důležitou akcí.",
        icon: "⚡",
        basePrice: 500,
        isActive: true,
        showOnHomepage: true,
        typeKey: "EXPRESS",
      },
      {
        name: "Záplatování & opravy",
        description:
          "Neviditelné záplaty, opravy roztržených švů, výměna zipů a knoflíků. Prodloužíme životnost vašeho oblečení.",
        icon: "🪡",
        basePrice: 150,
        isActive: true,
        showOnHomepage: false,
        typeKey: "ALTERATION",
      },
    ],
  });
  console.log("   ✓ Služby vytvořeny");

  // ── 3. PASSWORDS ─────────────────────────────────────────────────
  const [adminHash, tailorHash, customerHash] = await Promise.all([
    bcrypt.hash("admin123", 12),
    bcrypt.hash("krejci123", 12),
    bcrypt.hash("zakaznik123", 12),
  ]);

  // ── 4. ADMIN ─────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: "admin@tailorent.cz",
      name: "Správce Systému",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log("   ✓ Admin vytvořen");

  // ── 5. TAILORS ───────────────────────────────────────────────────
  const jana = await prisma.user.create({
    data: {
      email: "jana.novakova@tailorent.cz",
      name: "Jana Nováková",
      passwordHash: tailorHash,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Profesionální krejčí s 15 lety zkušeností. Specializuji se na úpravy obleků a šití na míru pro náročné zákazníky.",
          locality: "Praha",
          specializations: [ServiceType.ALTERATION, ServiceType.CUSTOM_SEWING],
          isAvailable: true,
          rating: 4.8,
          reviewCount: 42,
        },
      },
    },
    include: { tailorProfile: true },
  });

  const tomas = await prisma.user.create({
    data: {
      email: "tomas.krejci@tailorent.cz",
      name: "Tomáš Krejčí",
      passwordHash: tailorHash,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Rychlý a spolehlivý krejčí pro expresní zakázky i běžné úpravy. Dostupný i o víkendech.",
          locality: "Brno",
          specializations: [ServiceType.ALTERATION, ServiceType.EXPRESS],
          isAvailable: true,
          rating: 4.6,
          reviewCount: 28,
        },
      },
    },
    include: { tailorProfile: true },
  });

  const marie = await prisma.user.create({
    data: {
      email: "marie.horakova@tailorent.cz",
      name: "Marie Horáková",
      passwordHash: tailorHash,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Absolventka pražské módní školy, specialistka na svatební a společenské šití. Zkušenosti z módních přehlídek.",
          locality: "Praha",
          specializations: [ServiceType.CUSTOM_SEWING, ServiceType.EXPRESS],
          isAvailable: true,
          rating: 4.9,
          reviewCount: 67,
        },
      },
    },
    include: { tailorProfile: true },
  });

  const pavel = await prisma.user.create({
    data: {
      email: "pavel.dvorak@tailorent.cz",
      name: "Pavel Dvořák",
      passwordHash: tailorHash,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Všestranný krejčí se zaměřením na pánskou konfekci. 20 let praxe v Ostravě a okolí.",
          locality: "Ostrava",
          specializations: [ServiceType.ALTERATION, ServiceType.CUSTOM_SEWING, ServiceType.EXPRESS],
          isAvailable: true,
          rating: 4.5,
          reviewCount: 19,
        },
      },
    },
    include: { tailorProfile: true },
  });

  await prisma.user.create({
    data: {
      email: "eva.blazkova@tailorent.cz",
      name: "Eva Blažková",
      passwordHash: tailorHash,
      role: Role.TAILOR,
      tailorProfile: {
        create: {
          bio: "Krejčí se specializací na dámskou módu a šití na míru. Aktuálně na mateřské dovolené — dostupnost omezená.",
          locality: "Plzeň",
          specializations: [ServiceType.CUSTOM_SEWING],
          isAvailable: false,
          rating: 4.7,
          reviewCount: 33,
        },
      },
    },
    include: { tailorProfile: true },
  });

  const janaId  = jana.tailorProfile!.id;
  const tomasId = tomas.tailorProfile!.id;
  const marieId = marie.tailorProfile!.id;
  const pavelId = pavel.tailorProfile!.id;
  console.log("   ✓ Krejčí vytvořeni (Jana, Tomáš, Marie, Pavel, Eva)");

  // ── 6. CUSTOMERS ─────────────────────────────────────────────────
  const petr = await prisma.user.create({
    data: {
      email: "petr.svoboda@example.cz",
      name: "Petr Svoboda",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });

  const lucie = await prisma.user.create({
    data: {
      email: "lucie.prochazkova@example.cz",
      name: "Lucie Procházková",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });

  const martin = await prisma.user.create({
    data: {
      email: "martin.horak@example.cz",
      name: "Martin Horák",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });

  const katerina = await prisma.user.create({
    data: {
      email: "katerina.nova@example.cz",
      name: "Kateřina Nová",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
    },
  });
  console.log("   ✓ Zákazníci vytvořeni (Petr, Lucie, Martin, Kateřina)");

  // ── 7. ORDERS ────────────────────────────────────────────────────
  await prisma.order.createMany({
    data: [
      // ── COMPLETED ────────────────────────────────────────────────
      {
        customerId: petr.id,
        tailorId:   janaId,
        serviceType: ServiceType.ALTERATION,
        description: "Zkrácení kalhot o 4 cm, zúžení saka v pase",
        address: "Mánesova 12",
        city: "Praha",
        scheduledAt: ago(38),
        status: OrderStatus.COMPLETED,
        price: 450,
        notes: "Zákazník spokojený, doporučil nás kolegům.",
      },
      {
        customerId: lucie.id,
        tailorId:   marieId,
        serviceType: ServiceType.CUSTOM_SEWING,
        description: "Večerní šaty na ples, tmavě modrá látka, velikost 38",
        address: "Jugoslávských partyzánů 5",
        city: "Praha",
        scheduledAt: ago(55),
        status: OrderStatus.COMPLETED,
        price: 4800,
        notes: "Druhé měření proběhlo 15. 3., šaty hotovy v termínu.",
      },
      {
        customerId: martin.id,
        tailorId:   tomasId,
        serviceType: ServiceType.EXPRESS,
        description: "Urgentní oprava roztrženého saka — prezentace druhý den",
        address: "Lidická 33",
        city: "Brno",
        scheduledAt: ago(42),
        status: OrderStatus.COMPLETED,
        price: 650,
        notes: "Výjezd do 2 hodin, zákazník velmi spokojen.",
      },
      {
        customerId: katerina.id,
        tailorId:   janaId,
        serviceType: ServiceType.ALTERATION,
        description: "Úprava svatebních šatů — zúžení živůtku a zkrácení vlečky",
        address: "Holečkova 22",
        city: "Praha",
        scheduledAt: ago(50),
        status: OrderStatus.COMPLETED,
        price: 1200,
        notes: "Svatba 12. 4., práce hotová s týdenním předstihem.",
      },
      {
        customerId: petr.id,
        tailorId:   marieId,
        serviceType: ServiceType.CUSTOM_SEWING,
        description: "Pánský oblek na zakázku, šedý vlněný materiál",
        address: "Mánesova 12",
        city: "Praha",
        scheduledAt: ago(20),
        status: OrderStatus.COMPLETED,
        price: 6500,
        notes: "Tři zkoušení, finální výsledek vynikající.",
      },

      // ── IN_PROGRESS ──────────────────────────────────────────────
      {
        customerId: lucie.id,
        tailorId:   janaId,
        serviceType: ServiceType.CUSTOM_SEWING,
        description: "Letní šaty s výšivkou, bavlněná látka, pastelová zelená",
        address: "Jugoslávských partyzánů 5",
        city: "Praha",
        scheduledAt: from(3),
        status: OrderStatus.IN_PROGRESS,
        price: 3200,
        notes: "První měření proběhlo, šijeme.",
      },
      {
        customerId: martin.id,
        tailorId:   tomasId,
        serviceType: ServiceType.ALTERATION,
        description: "Zkrácení 3 párů kalhot, zúžení 2 košil",
        address: "Lidická 33",
        city: "Brno",
        scheduledAt: from(2),
        status: OrderStatus.IN_PROGRESS,
        price: 780,
        notes: null,
      },

      // ── CONFIRMED ────────────────────────────────────────────────
      {
        customerId: katerina.id,
        tailorId:   marieId,
        serviceType: ServiceType.EXPRESS,
        description: "Rychlá úprava koktejlových šatů před firemní akcí",
        address: "Holečkova 22",
        city: "Praha",
        scheduledAt: from(10),
        status: OrderStatus.CONFIRMED,
        price: null,
        notes: null,
      },
      {
        customerId: petr.id,
        tailorId:   janaId,
        serviceType: ServiceType.ALTERATION,
        description: "Zúžení zimního kabátu v ramenou a v pase",
        address: "Mánesova 12",
        city: "Praha",
        scheduledAt: from(14),
        status: OrderStatus.CONFIRMED,
        price: null,
        notes: null,
      },
      {
        customerId: lucie.id,
        tailorId:   pavelId,
        serviceType: ServiceType.ALTERATION,
        description: "Oprava podšívky v saku, přišití knoflíků na 2 košile",
        address: "Českobratrská 8",
        city: "Ostrava",
        scheduledAt: from(18),
        status: OrderStatus.CONFIRMED,
        price: null,
        notes: null,
      },

      // ── PENDING (bez přiřazeného krejčího) ───────────────────────
      {
        customerId: martin.id,
        tailorId:   null,
        serviceType: ServiceType.CUSTOM_SEWING,
        description: "Dámský kostým pro manželku, tmavě šedý, velikost 40",
        address: "Lidická 33",
        city: "Brno",
        scheduledAt: from(25),
        status: OrderStatus.PENDING,
        price: null,
        notes: null,
      },
      {
        customerId: katerina.id,
        tailorId:   null,
        serviceType: ServiceType.ALTERATION,
        description: "Zkrácení 4 sukní různých délek",
        address: "Holečkova 22",
        city: "Praha",
        scheduledAt: from(21),
        status: OrderStatus.PENDING,
        price: null,
        notes: null,
      },
      {
        customerId: petr.id,
        tailorId:   null,
        serviceType: ServiceType.EXPRESS,
        description: "Urgentní oprava saka — roztržený rukáv",
        address: "Mánesova 12",
        city: "Praha",
        scheduledAt: from(28),
        status: OrderStatus.PENDING,
        price: null,
        notes: null,
      },

      // ── CANCELLED ────────────────────────────────────────────────
      {
        customerId: petr.id,
        tailorId:   janaId,
        serviceType: ServiceType.ALTERATION,
        description: "Zúžení džínů — zákazník změnil plány",
        address: "Mánesova 12",
        city: "Praha",
        scheduledAt: ago(15),
        status: OrderStatus.CANCELLED,
        price: null,
        notes: "Zákazník sám zrušil den před termínem.",
      },
      {
        customerId: martin.id,
        tailorId:   tomasId,
        serviceType: ServiceType.EXPRESS,
        description: "Oprava boty — omyl zákazníka (obuv není v nabídce)",
        address: "Lidická 33",
        city: "Brno",
        scheduledAt: ago(22),
        status: OrderStatus.CANCELLED,
        price: null,
        notes: "Špatná kategorie objednávky, stornováno.",
      },
    ],
  });
  console.log("   ✓ Objednávky vytvořeny (5× COMPLETED, 2× IN_PROGRESS, 3× CONFIRMED, 3× PENDING, 2× CANCELLED)");

  // ── SUMMARY ──────────────────────────────────────────────────────
  console.log("\n✅ Seed dokončen!\n");
  console.log("── Přihlašovací údaje ────────────────────────────────");
  console.log("   ADMIN      admin@tailorent.cz          / admin123");
  console.log("   KREJČÍ     jana.novakova@tailorent.cz  / krejci123");
  console.log("   KREJČÍ     tomas.krejci@tailorent.cz   / krejci123");
  console.log("   KREJČÍ     marie.horakova@tailorent.cz / krejci123");
  console.log("   KREJČÍ     pavel.dvorak@tailorent.cz   / krejci123");
  console.log("   ZÁKAZNÍK   petr.svoboda@example.cz     / zakaznik123");
  console.log("   ZÁKAZNÍK   lucie.prochazkova@example.cz / zakaznik123");
  console.log("   ZÁKAZNÍK   martin.horak@example.cz     / zakaznik123");
  console.log("   ZÁKAZNÍK   katerina.nova@example.cz    / zakaznik123");
  console.log("──────────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
