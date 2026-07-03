-- CreateTable
CREATE TABLE "Period" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalesMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "totalRevenueAllChannels" REAL,
    "onlineRevenue" REAL,
    "onlineOrderCount" INTEGER,
    "averageOrderValue" REAL,
    "totalProductsSold" INTEGER,
    "productsPerOrder" REAL,
    CONSTRAINT "SalesMetrics_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinanceMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "grossProfit" REAL,
    "grossProfitMargin" REAL,
    "returnAmount" REAL,
    "returnRate" REAL,
    CONSTRAINT "FinanceMetrics_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "totalAdSpend" REAL,
    "purchaseCount" INTEGER,
    "cpa" REAL,
    "roas" REAL,
    "revenueGoogle" REAL,
    "revenueMeta" REAL,
    CONSTRAINT "AdMetrics_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerMetrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodId" INTEGER NOT NULL,
    "newCustomerCount" INTEGER,
    "newCustomerRate" REAL,
    "repeatOrderRate" REAL,
    "orderFrequencyDays" REAL,
    "churnRate" REAL,
    CONSTRAINT "CustomerMetrics_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "budget" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Period_type_startDate_endDate_key" ON "Period"("type", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SalesMetrics_periodId_key" ON "SalesMetrics"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceMetrics_periodId_key" ON "FinanceMetrics"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "AdMetrics_periodId_key" ON "AdMetrics"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMetrics_periodId_key" ON "CustomerMetrics"("periodId");

-- CreateIndex
CREATE INDEX "Campaign_periodMonth_idx" ON "Campaign"("periodMonth");
