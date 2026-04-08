import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any) || (session!.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Pouze admin může nahrávat obrázky." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Žádný soubor nebyl odeslán." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Nepodporovaný formát. Povoleny jsou JPEG, PNG, WebP a GIF." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Soubor je příliš velký. Maximum je 5 MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dest = path.join(UPLOADS_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(dest, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Interní chyba serveru." }, { status: 500 });
  }
}
