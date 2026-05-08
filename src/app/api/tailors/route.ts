<<<<<<< HEAD
=======
// src/app/api/tailors/route.ts
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
<<<<<<< HEAD
import { createTailorSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
=======

export async function GET(_req: NextRequest) {
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

<<<<<<< HEAD
    const tailors = await prisma.tailorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { rating: "desc" },
    });

=======
    const users = await prisma.user.findMany({
      where: { role: "TAILOR", tailorProfile: { isNot: null } },
      select: {
        name: true,
        email: true,
        tailorProfile: {
          select: {
            id: true,
            locality: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Order.tailorId odkazuje na TailorProfile.id, proto vracíme právě toto ID.
    const tailors = users
      .filter((u) => u.tailorProfile)
      .map((u) => ({
        id: u.tailorProfile!.id,
        name: u.name,
        email: u.email,
        tailorProfile: {
          locality: u.tailorProfile!.locality,
          rating: u.tailorProfile!.rating,
          reviewCount: u.tailorProfile!.reviewCount,
        },
      }));

>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
    return NextResponse.json({ data: tailors });
  } catch (error) {
    console.error("[GET /api/tailors]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

<<<<<<< HEAD
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTailorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, locality, specializations, bio, isAvailable } =
      parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Uživatel s tímto e-mailem již existuje" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "TAILOR",
        tailorProfile: {
          create: {
            locality,
            specializations,
            bio: bio ?? null,
            isAvailable: isAvailable ?? true,
          },
        },
      },
      include: {
        tailorProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ data: created.tailorProfile }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tailors]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
=======
>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
