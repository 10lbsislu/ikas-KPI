import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { campaignSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/campaigns?month=2026-06 -> o aya ait kampanyalar; month yoksa hepsi */
export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month") ?? undefined;
  const campaigns = await prisma.campaign.findMany({
    where: month ? { periodMonth: month } : undefined,
    orderBy: [{ periodMonth: "desc" }, { category: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(campaigns);
}

/** POST /api/campaigns -> yeni kampanya */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Doğrulama hatası", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const campaign = await prisma.campaign.create({ data: parsed.data });
    return NextResponse.json(campaign, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Kayıt başarısız" }, { status: 500 });
  }
}
