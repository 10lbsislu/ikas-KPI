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

// GET /api/entries/2026-01
export async function GET(_req: NextRequest, { params }: { params: { month: string } }) {
  const entry = await prisma.monthlyEntry.findUnique({
    where: { month: params.month },
    include: INCLUDE_ALL,
  });
  if (!entry) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json(entry);
}

// PUT /api/entries/2026-01 — tam güncelleme (upsert ile aynı mantık)
export async function PUT(req: NextRequest, { params }: { params: { month: string } }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  // month parametresini body'e ekle (form month göndermeyebilir)
  const merged = { month: params.month, year: parseInt(params.month.split("-")[0], 10), ...(body as object) };
  const parsed = monthlyEntrySchema.safeParse(merged);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { month, year, summary, product, customer, funnel, channels, socials } = parsed.data;
  const label = monthLabelTR(month);

  const entry = await prisma.monthlyEntry.upsert({
    where: { month },
    create: { month, label, year },
    update: { label, year, updatedAt: new Date() },
  });

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

  return NextResponse.json(result);
}

// DELETE /api/entries/2026-01 — cascade ile tüm sub-modeller de silinir
export async function DELETE(_req: NextRequest, { params }: { params: { month: string } }) {
  const entry = await prisma.monthlyEntry.findUnique({ where: { month: params.month } });
  if (!entry) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });

  await prisma.monthlyEntry.delete({ where: { id: entry.id } });
  return NextResponse.json({ ok: true });
}
