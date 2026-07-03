import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/campaigns/copy { from: "2026-05", to: "2026-06" }
 * Kaynak aydaki tüm kampanyaları hedef aya kopyalar (tekrar eden planlar için).
 */
export async function POST(req: NextRequest) {
  const { from, to } = await req.json();
  if (!/^\d{4}-\d{2}$/.test(from ?? "") || !/^\d{4}-\d{2}$/.test(to ?? "")) {
    return NextResponse.json({ error: "from ve to YYYY-MM olmalı" }, { status: 400 });
  }
  const source = await prisma.campaign.findMany({ where: { periodMonth: from } });
  if (source.length === 0) {
    return NextResponse.json({ error: "Kaynak ayda kampanya yok", copied: 0 }, { status: 404 });
  }
  await prisma.campaign.createMany({
    data: source.map((c) => ({
      periodMonth: to,
      category: c.category,
      no: c.no,
      duration: c.duration,
      format: c.format,
      creativeText: c.creativeText,
      description: c.description,
      objective: c.objective,
      targetUrl: c.targetUrl,
      targetCities: c.targetCities,
      targetAudience: c.targetAudience,
      targetingCriteria: c.targetingCriteria,
      trackingPlan: c.trackingPlan,
      budget: c.budget,
    })),
  });
  return NextResponse.json({ ok: true, copied: source.length });
}
