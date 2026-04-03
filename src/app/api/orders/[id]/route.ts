import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/validations";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const user = session.user as any;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { tailor: { select: { userId: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena." }, { status: 404 });
    }

    if (user.role === "TAILOR") {
      if (!order.tailor || order.tailor.userId !== user.id) {
        return NextResponse.json({ error: "Nemáte oprávnění upravit tuto objednávku." }, { status: 403 });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          notes: parsed.data.notes || null,
        },
        select: {
          id: true,
          status: true,
          notes: true,
        },
      });

      return NextResponse.json({ data: updated });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nemáte oprávnění upravit tuto objednávku." }, { status: 403 });
    }

    if (parsed.data.tailorId) {
      const tailorExists = await prisma.tailorProfile.findUnique({
        where: { id: parsed.data.tailorId },
        select: { id: true },
      });
      if (!tailorExists) {
        return NextResponse.json({ error: "Vybraný krejčí neexistuje." }, { status: 400 });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        serviceType: parsed.data.serviceType,
        description:
          parsed.data.description === undefined
            ? undefined
            : parsed.data.description.trim() || null,
        status: parsed.data.status,
        tailorId: parsed.data.tailorId,
        price: parsed.data.price,
        notes:
          parsed.data.notes === undefined
            ? undefined
            : parsed.data.notes.trim() || null,
      },
      select: {
        id: true,
        serviceType: true,
        description: true,
        status: true,
        tailorId: true,
        price: true,
        notes: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/orders/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

