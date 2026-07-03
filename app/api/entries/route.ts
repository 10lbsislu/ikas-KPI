import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { monthlyEntrySchema } from "@/lib/validation";
import { monthLabelTR } from "@/lib/kpi";

const INCLUDE_ALL = {
  summary: true,
  product: true,
  customer: true,
  funnel: true,
  channels: true,
  socials: true,
} as const;

// GET /api/entries?year=2026
export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");
  const entries = await prisma.monthlyEntry.findMany({
    where: year ? { year: parseInt(year, 10) } : undefined,
    include: INCLUDE_ALL,
    orderBy: { month: "asc" },
  });
  return NextResponse.json(entries);
}

// POST /api/entries  — upsert by month string
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const parsed = monthlyEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { month, year, summary, product, customer, funnel, channels, socials } = parsed.data;
  const label = monthLabelTR(month);

  // Upsert MonthlyEntry (ana kayıt)
  const entry = await prisma.monthlyEntry.upsert({
    where: { month },
    create: { month, label, year },
    update: { label, year, updatedAt: new Date() },
  });

  // Her sub-model için upsert (entryId benzersiz)
  await Promise.all([
    summary !== undefined
      ? prisma.monthlySummary.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...summary },
          update: summary,
        })
      : Promise.resolve(),

    product !== undefined
      ? prisma.productPerf.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...product },
          update: product,
        })
      : Promise.resolve(),

    customer !== undefined
      ? prisma.customerKPI.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...customer },
          update: customer,
        })
      : Promise.resolve(),

    funnel !== undefined
      ? prisma.funnel.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...funnel },
          update: funnel,
        })
      : Promise.resolve(),
  ]);

  // Kanal ve Sosyal: komple sil + yeniden yaz (en sade yaklaşım)
  if (channels !== undefined) {
    await prisma.channelPerf.deleteMany({ where: { entryId: entry.id } });
    if (channels.length > 0) {
      await prisma.channelPerf.createMany({
        data: channels.map((c) => ({ entryId: entry.id, ...c })),
      });
    }
  }

  if (socials !== undefined) {
    await prisma.socialMedia.deleteMany({ where: { entryId: entry.id } });
    if (socials.length > 0) {
      await prisma.socialMedia.createMany({
        data: socials.map((s) => ({ entryId: entry.id, ...s })),
      });
    }
  }

  const result = await prisma.monthlyEntry.findUnique({
    where: { id: entry.id },
    include: INCLUDE_ALL,
  });

  return NextResponse.json(result, { status: 201 });
}
