import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/validations";

const ORDER_INCLUDE = {
  customer: { select: { id: true, name: true, email: true } },
  tailor: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }
    const user = session.user as any;
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    if (
      user.role !== "ADMIN" &&
      order.customerId !== user.id &&
      order.tailor?.userId !== user.id
    ) {
      return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("[GET /api/orders/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }
    const user = session.user as any;
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { tailor: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, tailorId, price, notes } = parsed.data;

    // Krejčí: pouze stav vlastní zakázky
    if (user.role === "TAILOR") {
      if (order.tailor?.userId !== user.id) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (tailorId !== undefined || price !== undefined || notes !== undefined) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (status) {
        const allowed: Record<string, string[]> = {
          CONFIRMED: ["IN_PROGRESS"],
          IN_PROGRESS: ["COMPLETED"],
        };
        if (!allowed[order.status]?.includes(status)) {
          return NextResponse.json(
            { error: "Nepovolen přechod stavu" },
            { status: 400 }
          );
        }
      }
    }

    // Zákazník: pouze stornování vlastní objednávky
    if (user.role === "CUSTOMER") {
      if (order.customerId !== user.id) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (status !== "CANCELLED") {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        return NextResponse.json(
          { error: "Objednávku v tomto stavu nelze zrušit" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (tailorId !== undefined) {
      updateData.tailorId = tailorId ?? null;
      if (tailorId && order.status === "PENDING") {
        updateData.status = "CONFIRMED";
      }
    }
    if (price !== undefined) updateData.price = price;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: ORDER_INCLUDE,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PUT /api/orders/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }
    const user = session.user as any;
    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 });
    }

    if (user.role === "CUSTOMER") {
      if (order.customerId !== user.id) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        return NextResponse.json(
          { error: "Objednávku v tomto stavu nelze zrušit" },
          { status: 400 }
        );
      }
    } else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
    }

    const cancelled = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ data: cancelled });
  } catch (error) {
    console.error("[DELETE /api/orders/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
