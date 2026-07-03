import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildYearlySummary } from "@/lib/kpi";

// GET /api/entries/yearly?year=2026
export async function GET(req: NextRequest) {
  const yearParam = req.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  const entries = await prisma.monthlyEntry.findMany({
    where: { year },
    include: {
      summary: true,
      product: true,
      customer: true,
      funnel: true,
      channels: true,
      socials: true,
    },
    orderBy: { month: "asc" },
  });

  if (entries.length === 0) {
    return NextResponse.json({ year, monthCount: 0, entries: [] });
  }

  const yearly = buildYearlySummary(entries);

  return NextResponse.json({
    year,
    ...yearly,
    entries: entries.map((e) => ({
      month: e.month,
      label: e.label,
    })),
  });
}
