// src/app/api/services/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceSchema } from "@/lib/validations";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ data: services });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  if (parsed.data.showOnHomepage) {
    const count = await prisma.service.count({ where: { showOnHomepage: true } });
    if (count >= 3) {
      return NextResponse.json(
        { error: "Na homepage lze zobrazit nejvýše 3 služby. Nejdříve odeberte jednu." },
        { status: 422 }
      );
    }
  }

  const service = await prisma.service.create({ data: parsed.data });
  return NextResponse.json({ data: service }, { status: 201 });
}
