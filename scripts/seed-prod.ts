/**
 * Mevcut SQLite verisini (seed-data.json) PostgreSQL'e yükler.
 * Render'da bir kez çalıştırılır: npx tsx scripts/seed-prod.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const p = new PrismaClient();

async function main() {
  const raw = readFileSync("seed-data.json", "utf-8");
  const { entries, campaigns } = JSON.parse(raw);

  console.log(`Yükleniyor: ${entries.length} ay, ${campaigns.length} kampanya`);

  for (const e of entries) {
    const entry = await p.monthlyEntry.upsert({
      where: { month: e.month },
      create: { month: e.month, label: e.label, year: e.year },
      update: { label: e.label, year: e.year },
    });

    if (e.summary) {
      const { id, entryId, ...s } = e.summary;
      await p.monthlySummary.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...s },
        update: s,
      });
    }

    if (e.product) {
      const { id, entryId, ...s } = e.product;
      await p.productPerf.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...s },
        update: s,
      });
    }

    if (e.customer) {
      const { id, entryId, ...s } = e.customer;
      await p.customerKPI.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...s },
        update: s,
      });
    }

    if (e.funnel) {
      const { id, entryId, ...s } = e.funnel;
      await p.funnel.upsert({
        where: { entryId: entry.id },
        create: { entryId: entry.id, ...s },
        update: s,
      });
    }

    if (e.channels?.length) {
      await p.channelPerf.deleteMany({ where: { entryId: entry.id } });
      await p.channelPerf.createMany({
        data: e.channels.map(({ id, entryId, ...s }: any) => ({ entryId: entry.id, ...s })),
      });
    }

    if (e.socials?.length) {
      await p.socialMedia.deleteMany({ where: { entryId: entry.id } });
      await p.socialMedia.createMany({
        data: e.socials.map(({ id, entryId, ...s }: any) => ({ entryId: entry.id, ...s })),
      });
    }

    console.log(`  ✓ ${e.label}`);
  }

  for (const c of campaigns) {
    const { id, createdAt, updatedAt, ...data } = c;
    await p.campaign.upsert({
      where: { id: c.id },
      create: { id: c.id, ...data },
      update: data,
    });
  }

  console.log(`\n✓ Tüm veriler yüklendi.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
