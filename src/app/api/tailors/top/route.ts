import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Veřejný endpoint — vrací top 3 dostupné krejčí dle průměrného hodnocení z TailorProfile
export async function GET() {
  try {
    const tailors = await prisma.tailorProfile.findMany({
      where: { isAvailable: true, reviewCount: { gt: 0 } },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 3,
      select: {
        id: true,
        locality: true,
        specializations: true,
        rating: true,
        reviewCount: true,
        user: { select: { name: true } },
      },
    });

    const data = tailors.map((t) => ({
      id: t.id,
      name: t.user.name,
      locality: t.locality,
      rating: t.rating,
      reviewCount: t.reviewCount,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/tailors/top]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
