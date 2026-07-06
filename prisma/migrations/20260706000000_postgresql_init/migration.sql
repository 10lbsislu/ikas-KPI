-- CreateTable
CREATE TABLE "MonthlyEntry" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySummary" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "ga4Gross" DOUBLE PRECISION,
    "ikasGross" DOUBLE PRECISION,
    "cancelled" DOUBLE PRECISION,
    "returned" DOUBLE PRECISION,
    "netSales" DOUBLE PRECISION,
    "orderCount" INTEGER,
    "aov" DOUBLE PRECISION,
    "adSpend" DOUBLE PRECISION,
    "grossRoas" DOUBLE PRECISION,
    "netRoas" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPerf" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "orderCount" INTEGER,
    "productsSold" INTEGER,
    "productsPerOrder" DOUBLE PRECISION,
    "topProduct" TEXT,
    "notes" TEXT,

    CONSTRAINT "ProductPerf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerKPI" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "totalCustomers" INTEGER,
    "newCustomers" INTEGER,
    "repeatCustomers" INTEGER,
    "repeatRate" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "CustomerKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funnel" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "sessions" INTEGER,
    "productViews" INTEGER,
    "addToCart" INTEGER,
    "checkout" INTEGER,
    "purchase" INTEGER,
    "cartAbandon" INTEGER,
    "checkoutAbandon" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelPerf" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "spend" DOUBLE PRECISION,
    "grossSales" DOUBLE PRECISION,
    "orderCount" INTEGER,
    "roas" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "ChannelPerf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "followers" INTEGER,
    "gained" INTEGER,
    "views" INTEGER,
    "engagement" TEXT,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "no" TEXT,
    "duration" TEXT,
    "format" TEXT,
    "creativeText" TEXT,
    "description" TEXT,
    "objective" TEXT,
    "targetUrl" TEXT,
    "targetCities" TEXT,
    "targetAudience" TEXT,
    "targetingCriteria" TEXT,
    "trackingPlan" TEXT,
    "budget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyEntry_month_key" ON "MonthlyEntry"("month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySummary_entryId_key" ON "MonthlySummary"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPerf_entryId_key" ON "ProductPerf"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerKPI_entryId_key" ON "CustomerKPI"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "Funnel_entryId_key" ON "Funnel"("entryId");

-- CreateIndex
CREATE INDEX "ChannelPerf_entryId_idx" ON "ChannelPerf"("entryId");

-- CreateIndex
CREATE INDEX "SocialMedia_entryId_idx" ON "SocialMedia"("entryId");

-- CreateIndex
CREATE INDEX "Campaign_periodMonth_idx" ON "Campaign"("periodMonth");

-- AddForeignKey
ALTER TABLE "MonthlySummary" ADD CONSTRAINT "MonthlySummary_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPerf" ADD CONSTRAINT "ProductPerf_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerKPI" ADD CONSTRAINT "CustomerKPI_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelPerf" ADD CONSTRAINT "ChannelPerf_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "MonthlyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
