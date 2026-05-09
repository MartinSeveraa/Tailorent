// src/app/api/tailors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTailorSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const tailors = await prisma.tailorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({ data: tailors });
  } catch (error) {
    console.error("[GET /api/tailors]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

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

    const { name, email, password, locality, specializations, bio, isAvailable } = parsed.data;

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
