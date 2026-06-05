import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add your PostgreSQL connection string in .env before starting the app."
  )
}

if (databaseUrl.startsWith("file:")) {
  throw new Error(
    "DATABASE_URL still points to SQLite. Replace it with a PostgreSQL connection string before running or deploying."
  )
}

const parsedDatabaseUrl = new URL(databaseUrl)

if (
  process.env.VERCEL === "1" &&
  ["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname)
) {
  throw new Error(
    "DATABASE_URL points to a local database. Set DATABASE_URL in Vercel to your Neon pooled PostgreSQL connection string."
  )
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: databaseUrl,
  })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.pgPool = pool
}
