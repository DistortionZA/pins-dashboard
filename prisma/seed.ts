import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import "dotenv/config"
import {
  garmentMarkupSeedData,
  garmentSeedData,
  printPriceSeedData,
} from "./seed-data"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.")
}

const pool = new Pool({
  connectionString: databaseUrl,
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main() {
  console.log("Seeding Postgres database...")

  await prisma.designPrint.deleteMany()
  await prisma.design.deleteMany()
  await prisma.order.deleteMany()
  await prisma.printPrice.deleteMany()
  await prisma.garmentMarkup.deleteMany()
  await prisma.garment.deleteMany()

  await prisma.garment.createMany({ data: garmentSeedData })
  await prisma.garmentMarkup.createMany({ data: garmentMarkupSeedData })
  await prisma.printPrice.createMany({ data: printPriceSeedData })

  console.log("Seed complete")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
