<<<<<<< HEAD
// src/app/api/services/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateServiceSchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Enforce max 3 on homepage when turning it ON
  if (parsed.data.showOnHomepage === true) {
    const count = await prisma.service.count({
      where: { showOnHomepage: true, id: { not: id } },
    });
    if (count >= 3) {
      return NextResponse.json(
        { error: "Na homepage lze zobrazit nejvýše 3 služby. Nejdříve odeberte jednu." },
        { status: 422 }
      );
    }
  }

  const service = await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: service });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ data: null });
}
=======
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SERVICES_PATH = path.join(process.cwd(), "data", "services.json");

const updateServiceSchema = z.object({
  serviceType: z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(500),
  priceFrom: z.number().positive(),
  imageUrl: z.string().min(1).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
    message: "imageUrl musí být platná URL nebo cesta začínající /",
  }),
  isActive: z.boolean(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any) || (session!.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Pouze admin může upravovat služby." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const raw = await fs.readFile(SERVICES_PATH, "utf-8");
    const services = JSON.parse(raw) as Array<any>;
    const idx = services.findIndex((s) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Služba nenalezena." }, { status: 404 });
    }

    services[idx] = { ...services[idx], ...parsed.data };
    await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2), "utf-8");
    return NextResponse.json({ data: services[idx] });
  } catch (error) {
    console.error("[PATCH /api/services/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any) || (session!.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Pouze admin může mazat služby." }, { status: 403 });
    }

    const { id } = await params;
    const raw = await fs.readFile(SERVICES_PATH, "utf-8");
    const services = JSON.parse(raw) as Array<any>;
    const next = services.filter((s) => s.id !== id);

    if (next.length === services.length) {
      return NextResponse.json({ error: "Služba nenalezena." }, { status: 404 });
    }

    await fs.writeFile(SERVICES_PATH, JSON.stringify(next, null, 2), "utf-8");
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[DELETE /api/services/:id]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

>>>>>>> b6345f9e66398eff7221d98f9b9fcd5e3dcea76a
