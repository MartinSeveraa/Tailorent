// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations";
import { findMatchingTailor } from "@/lib/matching";
import { createNotification } from "@/lib/notifications";
import { SERVICE_TYPE_LABELS } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const user = session.user as any;

    const where =
      user.role === "ADMIN"
        ? {}
        : user.role === "TAILOR"
        ? { tailor: { userId: user.id } }
        : { customerId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        tailor: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const scheduledAt = new Date(parsed.data.scheduledAt);

    const tailorId = await findMatchingTailor(
      parsed.data.city,
      parsed.data.serviceType,
      scheduledAt
    );

    const order = await prisma.order.create({
      data: {
        ...parsed.data,
        scheduledAt,
        customerId: user.id,
        ...(tailorId && { tailorId, status: "CONFIRMED" }),
      },
      include: { tailor: { include: { user: true } } },
    });

    if (tailorId && order.tailor) {
      const serviceLabel = SERVICE_TYPE_LABELS[parsed.data.serviceType as keyof typeof SERVICE_TYPE_LABELS];
      await createNotification(
        order.tailor.user.id,
        `Byla vám přiřazena nová zakázka: ${serviceLabel} — ${parsed.data.city}`,
        `/dashboard/orders/${order.id}`
      );
    }

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
