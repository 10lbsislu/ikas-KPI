import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { campaignSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** PUT /api/campaigns/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const campaign = await prisma.campaign.update({ where: { id }, data: parsed.data });
    return NextResponse.json(campaign);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

/** DELETE /api/campaigns/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silme başarısız" }, { status: 500 });
  }
}
