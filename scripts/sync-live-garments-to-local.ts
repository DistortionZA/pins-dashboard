import "dotenv/config"

import { PrismaClient, type Garment, type GarmentType } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"])
const GARMENT_TABLE_NAME = 'public."Garment"'
const CONFIRMATION_ENV = "CONFIRM_SYNC_LIVE_GARMENTS"

type PrivilegeCheck = {
  can_select: boolean
  can_insert: boolean
  can_update: boolean
  can_delete: boolean
}

type SyncCounters = {
  created: number
  updated: number
  skipped: number
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required.`)
  }

  return value
}

function parsePostgresUrl(value: string, envName: string) {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(`${envName} must be a valid PostgreSQL connection string.`)
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error(`${envName} must use the postgresql:// protocol.`)
  }

  return url
}

function databaseName(url: URL) {
  return decodeURIComponent(url.pathname.replace(/^\//, ""))
}

function assertSafeEnvironment() {
  if (process.env[CONFIRMATION_ENV] !== "1") {
    throw new Error(`${CONFIRMATION_ENV} must equal "1" to run this sync.`)
  }

  const localDatabaseUrl = requireEnv("DATABASE_URL")
  const liveDatabaseUrl = requireEnv("LIVE_DATABASE_READONLY_URL")

  if (localDatabaseUrl === liveDatabaseUrl) {
    throw new Error("DATABASE_URL and LIVE_DATABASE_READONLY_URL must not be the same value.")
  }

  const localUrl = parsePostgresUrl(localDatabaseUrl, "DATABASE_URL")
  const liveUrl = parsePostgresUrl(liveDatabaseUrl, "LIVE_DATABASE_READONLY_URL")

  if (LOCAL_HOSTS.has(liveUrl.hostname.toLowerCase())) {
    throw new Error("LIVE_DATABASE_READONLY_URL must not point to a local database host.")
  }

  const sameHost = localUrl.hostname.toLowerCase() === liveUrl.hostname.toLowerCase()
  const sameDatabase = databaseName(localUrl) === databaseName(liveUrl)
  const sameUser = decodeURIComponent(localUrl.username) === decodeURIComponent(liveUrl.username)

  if (sameHost && sameDatabase && sameUser) {
    throw new Error(
      "DATABASE_URL appears to use the same host, database, and user as LIVE_DATABASE_READONLY_URL.",
    )
  }

  return { localDatabaseUrl, liveDatabaseUrl }
}

function createPrismaClient(connectionString: string) {
  const pool = new Pool({ connectionString })
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
    log: ["error"],
  })

  return { prisma, pool }
}

function toFiniteNumber(value: unknown, fieldName: string) {
  if (typeof value === "number") {
    if (Number.isFinite(value)) return value
    throw new Error(`${fieldName} is not finite.`)
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.trim().replace(/,/g, ""))
    if (Number.isFinite(parsedValue)) return parsedValue
    throw new Error(`${fieldName} is not numeric.`)
  }

  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    const parsedValue = value.toNumber()
    if (Number.isFinite(parsedValue)) return parsedValue
    throw new Error(`${fieldName} is not numeric.`)
  }

  throw new Error(`${fieldName} is missing.`)
}

function toOptionalFiniteNumber(value: unknown, fieldName: string) {
  if (value === null || typeof value === "undefined") return null
  return toFiniteNumber(value, fieldName)
}

function normalizeGarment(garment: Garment): Garment {
  return {
    id: garment.id,
    code: garment.code,
    altCode: garment.altCode,
    brandName: garment.brandName,
    name: garment.name,
    color: garment.color,
    type: garment.type as GarmentType,
    basePrice: toFiniteNumber(garment.basePrice, "basePrice"),
    gbpPrice: toOptionalFiniteNumber(garment.gbpPrice, "gbpPrice"),
    extraSizeCost: toOptionalFiniteNumber(garment.extraSizeCost, "extraSizeCost"),
    tags: garment.tags,
  }
}

async function assertLiveGarmentReadOnly(prisma: PrismaClient) {
  const result = await prisma.$queryRaw<PrivilegeCheck[]>`
    SELECT
      has_table_privilege(current_user, ${GARMENT_TABLE_NAME}, 'SELECT') AS can_select,
      has_table_privilege(current_user, ${GARMENT_TABLE_NAME}, 'INSERT') AS can_insert,
      has_table_privilege(current_user, ${GARMENT_TABLE_NAME}, 'UPDATE') AS can_update,
      has_table_privilege(current_user, ${GARMENT_TABLE_NAME}, 'DELETE') AS can_delete
  `

  const privileges = result[0]

  if (!privileges?.can_select) {
    throw new Error("LIVE_DATABASE_READONLY_URL user does not have SELECT access to Garment.")
  }

  if (privileges.can_insert || privileges.can_update || privileges.can_delete) {
    throw new Error(
      "LIVE_DATABASE_READONLY_URL must use a read-only role. The current live user has Garment write privileges.",
    )
  }
}

async function syncGarments(livePrisma: PrismaClient, localPrisma: PrismaClient) {
  const liveGarments = await livePrisma.garment.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      altCode: true,
      brandName: true,
      name: true,
      color: true,
      type: true,
      basePrice: true,
      gbpPrice: true,
      extraSizeCost: true,
      tags: true,
    },
  })

  const localIds = new Set(
    (
      await localPrisma.garment.findMany({
        select: { id: true },
      })
    ).map((garment) => garment.id),
  )

  const counters: SyncCounters = {
    created: 0,
    updated: 0,
    skipped: 0,
  }

  for (const liveGarment of liveGarments) {
    try {
      const garment = normalizeGarment(liveGarment)
      const existed = localIds.has(garment.id)

      await localPrisma.garment.upsert({
        where: { id: garment.id },
        create: garment,
        update: {
          code: garment.code,
          altCode: garment.altCode,
          brandName: garment.brandName,
          name: garment.name,
          color: garment.color,
          type: garment.type,
          basePrice: garment.basePrice,
          gbpPrice: garment.gbpPrice,
          extraSizeCost: garment.extraSizeCost,
          tags: garment.tags,
        },
      })

      if (existed) {
        counters.updated += 1
      } else {
        counters.created += 1
        localIds.add(garment.id)
      }
    } catch (error) {
      counters.skipped += 1
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error(`Skipped garment id=${liveGarment.id} code=${liveGarment.code}: ${message}`)
    }
  }

  return {
    found: liveGarments.length,
    ...counters,
  }
}

async function main() {
  const { localDatabaseUrl, liveDatabaseUrl } = assertSafeEnvironment()
  const live = createPrismaClient(liveDatabaseUrl)
  const local = createPrismaClient(localDatabaseUrl)

  try {
    await assertLiveGarmentReadOnly(live.prisma)
    const result = await syncGarments(live.prisma, local.prisma)

    console.log(`Live garments found: ${result.found}`)
    console.log(`Created locally: ${result.created}`)
    console.log(`Updated locally: ${result.updated}`)
    console.log(`Skipped: ${result.skipped}`)
  } finally {
    await live.prisma.$disconnect()
    await local.prisma.$disconnect()
    await live.pool.end()
    await local.pool.end()
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown sync error."
  console.error(`Garment sync refused or failed: ${message}`)
  process.exitCode = 1
})
