import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Veřejný endpoint — bez auth — vrací top 3 krejčí dle průměrného hodnocení z recenzí
export async function GET() {
  try {
    // Agregace přímo přes vazbu tailorProfileId
    const groups = await (prisma as any).review.groupBy({
      by: ["tailorProfileId"],
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: [{ _avg: { rating: "desc" } }, { _count: { rating: "desc" } }],
      take: 3,
    });

    if (!groups.length) {
      return NextResponse.json({ data: [] });
    }

    const tailorIds = groups.map((g: any) => g.tailorProfileId);

    const profiles = await prisma.tailorProfile.findMany({
      where: { id: { in: tailorIds }, isAvailable: true },
      select: {
        id: true,
        locality: true,
        specializations: true,
        user: { select: { name: true } },
      },
    });

    // Zachováme pořadí dle ratingu
    const data = groups
      .map((g: any) => {
        const profile = profiles.find((p) => p.id === g.tailorProfileId);
        if (!profile) return null;
        return {
          id: profile.id,
          name: profile.user.name,
          locality: profile.locality,
          rating: g._avg.rating as number,
          reviewCount: g._count.rating as number,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/tailors/top]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
