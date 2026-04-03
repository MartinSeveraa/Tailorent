// src/app/api/tailors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

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

    return NextResponse.json({ data: tailors });
  } catch (error) {
    console.error("[GET /api/tailors]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

