import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const SERVICES_PATH = path.join(process.cwd(), "data", "services.json");
const serviceTypeSchema = z.enum(["ALTERATION", "CUSTOM_SEWING", "EXPRESS"]);
const createServiceSchema = z.object({
  serviceType: serviceTypeSchema,
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(500),
  priceFrom: z.number().positive(),
  imageUrl: z.string().min(1).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
    message: "imageUrl musí být platná URL nebo cesta začínající /",
  }),
  isActive: z.boolean(),
});

export async function GET() {
  try {
    const raw = await fs.readFile(SERVICES_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/services]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any) || (session!.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Pouze admin může přidávat služby." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Neplatná data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const raw = await fs.readFile(SERVICES_PATH, "utf-8");
    const services = JSON.parse(raw) as Array<any>;
    const id = `service_${Date.now()}`;

    const newService = { id, ...parsed.data };
    services.push(newService);

    await fs.writeFile(SERVICES_PATH, JSON.stringify(services, null, 2), "utf-8");
    return NextResponse.json({ data: newService }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/services]", error);
    return NextResponse.json({ error: "Interní chyba serveru" }, { status: 500 });
  }
}

