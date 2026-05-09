import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

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

    const { status, tailorId, price, notes, priceAccepted } = parsed.data;

    // Krejčí: pouze stav vlastní zakázky
    if (user.role === "TAILOR") {
      if (order.tailor?.userId !== user.id) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (tailorId !== undefined || price !== undefined || notes !== undefined || priceAccepted !== undefined) {
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

    // Zákazník: storno nebo přijetí/odmítnutí ceny
    if (user.role === "CUSTOMER") {
      if (order.customerId !== user.id) {
        return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
      }
      if (priceAccepted !== undefined) {
        if (order.price === null) {
          return NextResponse.json({ error: "Cena ještě nebyla stanovena." }, { status: 400 });
        }
        if ((order as any).priceAccepted !== null) {
          return NextResponse.json({ error: "Cenu jste již vyjádřili." }, { status: 400 });
        }
      } else {
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
    }

    // Kontrola double-bookingu při ručním přiřazení krejčího adminem
    if (user.role === "ADMIN" && tailorId) {
      const window = 2 * 60 * 60 * 1000;
      const conflict = await prisma.order.findFirst({
        where: {
          tailorId,
          id: { not: id },
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          scheduledAt: {
            gte: new Date(order.scheduledAt.getTime() - window),
            lte: new Date(order.scheduledAt.getTime() + window),
          },
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Krejčí má v tomto čase jinou zakázku (±2 hodiny). Vyberte jiného krejčího nebo jiný termín." },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (tailorId !== undefined) {
      updateData.tailorId = tailorId ?? null;
      if (tailorId && order.status === "PENDING") updateData.status = "CONFIRMED";
    }
    if (price !== undefined) updateData.price = price;
    if (notes !== undefined) updateData.notes = notes;
    if (priceAccepted !== undefined) {
      updateData.priceAccepted = priceAccepted;
      if (!priceAccepted) updateData.status = "CANCELLED";
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: ORDER_INCLUDE,
    });

    // ── Notifikace ───────────────────────────────────────────────
    const orderLink = `/dashboard/orders/${id}`;

    // Admin nastavil cenu → notifikace zákazníkovi
    if (price !== undefined) {
      await createNotification(
        order.customerId,
        `Byla stanovena cena vaší objednávky: ${Number(price).toLocaleString("cs-CZ")} Kč. Potvrďte prosím přijetí.`,
        orderLink
      );
    }

    // Admin přiřadil krejčího → notifikace zákazníkovi + krejčímu
    if (tailorId && tailorId !== order.tailorId) {
      const newTailor = await prisma.tailorProfile.findUnique({
        where: { id: tailorId },
        include: { user: true },
      });
      if (newTailor) {
        await createNotification(
          order.customerId,
          `Byl vám přiřazen krejčí: ${newTailor.user.name}`,
          orderLink
        );
        await createNotification(
          newTailor.user.id,
          `Byla vám přiřazena nová zakázka — ${order.city}`,
          `/dashboard/orders/${id}`
        );
      }
    }

    // Krejčí označil zakázku jako dokončenou → notifikace zákazníkovi
    if (status === "COMPLETED") {
      await createNotification(
        order.customerId,
        "Vaše zakázka byla dokončena. Ohodnoťte krejčího!",
        orderLink
      );
    }

    // Zákazník odmítl cenu → notifikace krejčímu (pokud je přiřazen)
    if (priceAccepted === false && order.tailor) {
      await createNotification(
        order.tailor.userId,
        "Zákazník odmítl stanovenou cenu — zakázka byla zrušena.",
        undefined
      );
    }

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
