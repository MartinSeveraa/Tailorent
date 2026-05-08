import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Pouze zákazník může hodnotit." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Neplatné hodnocení (1–5)." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena." }, { status: 404 });
    }
    if (order.customerId !== user.id) {
      return NextResponse.json({ error: "Nemáte přístup k této objednávce." }, { status: 403 });
    }
    if (order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Hodnotit lze pouze dokončené objednávky." }, { status: 400 });
    }
    if (!order.tailorId) {
      return NextResponse.json({ error: "Objednávka nemá přiřazeného krejčího." }, { status: 400 });
    }

    // Kontrola duplicitní recenze
    const existing = await (prisma as any).review.findUnique({
      where: { orderId: id },
    });
    if (existing) {
      return NextResponse.json({ error: "Tuto objednávku jste již hodnotili." }, { status: 409 });
    }

    const review = await (prisma as any).review.create({
      data: {
        orderId: id,
        tailorProfileId: order.tailorId,
        customerId: user.id,
        rating: parsed.data.rating,
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders/:id/review]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
