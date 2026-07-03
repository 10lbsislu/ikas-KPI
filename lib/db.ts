import { PrismaClient } from "@prisma/client";

// Geliştirme sırasında hot-reload'da birden fazla client oluşmasını önler.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
