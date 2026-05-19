import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const base = process.env.DATABASE_URL ?? "";
  // Supabase uses PgBouncer in transaction mode. Without connection_limit=1,
  // Prisma opens 2+N connections per instance and exhausts the pool.
  const url = base.includes("pgbouncer=true")
    ? base
    : base + (base.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";

  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
