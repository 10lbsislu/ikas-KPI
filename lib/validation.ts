import { z } from "zod";
import { parseTrNumber } from "./format";

const trNumber = z
  .union([z.string(), z.number(), z.null()])
  .transform((v, ctx) => {
    if (v === null || v === "") return null;
    const n = parseTrNumber(v);
    if (n === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçerli bir sayı girin" });
      return z.NEVER;
    }
    return n;
  })
  .nullable();

const trInt = z
  .union([z.string(), z.number(), z.null()])
  .transform((v, ctx) => {
    if (v === null || v === "") return null;
    const n = parseTrNumber(v);
    if (n === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçerli bir sayı girin" });
      return z.NEVER;
    }
    return Math.round(n);
  })
  .nullable();

export const summarySchema = z.object({
  ga4Gross: trNumber,
  ikasGross: trNumber,
  cancelled: trNumber,
  returned: trNumber,
  netSales: trNumber,
  orderCount: trInt,
  aov: trNumber,
  adSpend: trNumber,
  grossRoas: trNumber,
  netRoas: trNumber,
  notes: z.string().nullable().optional(),
});

export const productSchema = z.object({
  orderCount: trInt,
  productsSold: trInt,
  productsPerOrder: trNumber,
  topProduct: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const customerSchema = z.object({
  totalCustomers: trInt,
  newCustomers: trInt,
  repeatCustomers: trInt,
  repeatRate: trNumber,
  notes: z.string().nullable().optional(),
  // churnRate YOK — lib/kpi.ts'de türetilir
});

export const funnelSchema = z.object({
  sessions: trInt,
  productViews: trInt,
  addToCart: trInt,
  checkout: trInt,
  purchase: trInt,
  cartAbandon: trInt,
  checkoutAbandon: trInt,
  notes: z.string().nullable().optional(),
});

export const channelPerfSchema = z.object({
  channel: z.string().min(1),
  spend: trNumber,
  grossSales: trNumber,
  orderCount: trInt,
  roas: trNumber,
  notes: z.string().nullable().optional(),
});

export const socialMediaSchema = z.object({
  platform: z.string().min(1),
  followers: trInt,
  gained: trInt,
  views: trInt,
  engagement: z.string().nullable().optional(),
});

export const monthlyEntrySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM formatında olmalı"),
  label: z.string().min(1),
  year: z.number().int(),
  summary: summarySchema.optional(),
  product: productSchema.optional(),
  customer: customerSchema.optional(),
  funnel: funnelSchema.optional(),
  channels: z.array(channelPerfSchema).optional(),
  socials: z.array(socialMediaSchema).optional(),
});

export const campaignSchema = z.object({
  periodMonth: z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM formatında olmalı"),
  category: z.enum(["SALES_META", "AWARENESS_META", "GOOGLE", "OTHER"]),
  no: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  creativeText: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  targetUrl: z.string().nullable().optional(),
  targetCities: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  targetingCriteria: z.string().nullable().optional(),
  trackingPlan: z.string().nullable().optional(),
  budget: trNumber,
});

export type MonthlyEntryInput = z.infer<typeof monthlyEntrySchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
