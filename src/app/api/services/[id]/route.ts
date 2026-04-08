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

