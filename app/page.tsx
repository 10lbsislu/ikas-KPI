import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/DashboardClient";
import { buildYearlySummary } from "@/lib/kpi";

export const dynamic = "force-dynamic";

const INCLUDE_ALL = {
  summary: true,
  product: true,
  customer: true,
  funnel: true,
  channels: true,
  socials: true,
} as const;

export default async function HomePage() {
  const entries = await prisma.monthlyEntry.findMany({
    orderBy: { month: "asc" },
    include: INCLUDE_ALL,
  });

  // Yıllık özet grupları
  const yearMap = new Map<number, typeof entries>();
  for (const e of entries) {
    if (!yearMap.has(e.year)) yearMap.set(e.year, []);
    yearMap.get(e.year)!.push(e);
  }
  const yearlySummaries = [...yearMap.entries()].map(([year, ents]) => ({
    year,
    ...buildYearlySummary(ents),
  }));

  return <DashboardClient entries={entries} yearlySummaries={yearlySummaries} />;
}
