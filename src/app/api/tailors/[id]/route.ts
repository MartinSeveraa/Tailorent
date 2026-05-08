import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTailorSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }
    const { id } = await params;

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!tailor) {
      return NextResponse.json({ error: "Krejčí nenalezen" }, { status: 404 });
    }

    return NextResponse.json({ data: tailor });
  } catch (error) {
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
    }

    const { id } = await params;
    const tailor = await prisma.tailorProfile.findUnique({ where: { id } });

    if (!tailor) {
      return NextResponse.json({ error: "Krejčí nenalezen" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateTailorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, locality, specializations, bio, isAvailable } = parsed.data;

    if (name) {
      await prisma.user.update({ where: { id: tailor.userId }, data: { name } });
    }

    const updated = await prisma.tailorProfile.update({
      where: { id },
      data: {
        ...(locality !== undefined && { locality }),
        ...(specializations !== undefined && { specializations }),
        ...(bio !== undefined && { bio }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PUT /api/tailors/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Přístup zamítnut" }, { status: 403 });
    }

    const { id } = await params;
    const tailor = await prisma.tailorProfile.findUnique({ where: { id } });

    if (!tailor) {
      return NextResponse.json({ error: "Krejčí nenalezen" }, { status: 404 });
    }

    // Smazání uživatele kaskádově smaže TailorProfile;
    // FK v orders (tailorId) je SET NULL dle migrace
    await prisma.user.delete({ where: { id: tailor.userId } });

    return NextResponse.json({ message: "Krejčí byl smazán" });
  } catch (error) {
    console.error("[DELETE /api/tailors/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}
