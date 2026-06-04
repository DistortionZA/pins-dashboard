import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const sqliteAdapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
})

const prisma = new PrismaClient({ adapter: sqliteAdapter })

async function main() {
  console.log("🌱 Seeding...")

  // Clear existing data (safe for dev)
  await prisma.printPrice.deleteMany()
  await prisma.garmentMarkup.deleteMany()
  

  // ✅ Garment markups
  await prisma.garmentMarkup.createMany({
    data: [
        
      { garmentType: "TSHIRT", markupValue: 3 },
      { garmentType: "LONGSLEEVE", markupValue: 3.5 },
      { garmentType: "HOODIE", markupValue: 5 }
    ]
    
  })
  
  // ✅ Garments
await prisma.garment.createMany({
  data: [
    { code: "GI2000", brandName: "Gildan", name: "GI2000 ULTRA TEE white", color: "White", type: "TSHIRT", basePrice: 2.35, extraSizeCost: 1.10 },
    { code: "GI2000", brandName: "Gildan", name: "GI2000 ULTRA TEE black", color: "Black", type: "TSHIRT", basePrice: 2.80, extraSizeCost: 1.10 },
    { code: "GI4100", brandName: "Gildan", name: "GI4100 PREMIUM TEE white", color: "White", type: "TSHIRT", basePrice: 1.95, extraSizeCost: 0.60 },
    { code: "GI4100", brandName: "Gildan", name: "GI4100 PREMIUM TEE black", color: "Black", type: "TSHIRT", basePrice: 2.35, extraSizeCost: 0.60 },
    { code: "GI64000", brandName: "Gildan", name: "GI64000 SOFTSTYLE TEE white", color: "White", type: "TSHIRT", basePrice: 1.85, extraSizeCost: 0.60 },
    { code: "GI64000", brandName: "Gildan", name: "GI64000 SOFTSTYLE TEE black", color: "Black", type: "TSHIRT", basePrice: 2.25, extraSizeCost: 0.70 },

    { code: "GI18500-HOOD", brandName: "Gildan", name: "GI18500 HEAVY HOODIE", type: "HOODIE", basePrice: 8.25, extraSizeCost: 2.00 },
    { code: "JH001-HOOD", brandName: "AWDis", name: "AWDis JH001 HOODIE", type: "HOODIE", basePrice: 9.50, extraSizeCost: 1.50 },

    { code: "GI2400-LONG", brandName: "Gildan", name: "GI2400 ULTRA COTTON LONG", type: "LONGSLEEVE", basePrice: 4.70, extraSizeCost: 2.00 },
    { code: "GI64400-LONG", brandName: "Gildan", name: "GI64400 SOFTSTYLE LONG", type: "LONGSLEEVE", basePrice: 3.30 },

    { code: "B45-BEANIE", brandName: "Beechfield", name: "Beechfield Beanie", type: "TSHIRT", basePrice: 2.00 },
    { code: "B653-CAP", brandName: "Beechfield", name: "Beechfield Cap", type: "TSHIRT", basePrice: 3.20 }
  ]
})


  // ✅ Quantity tiers
  const tiers = [
    { min: 50, max: 99 },
    { min: 100, max: 249 },
    { min: 250, max: 499 },
    { min: 500, max: 999 },
    { min: 1000, max: 2000 }
  ]

  // ✅ Production pricing
  const production = [
    [1.40, 1.15, 1.00, 0.90, 0.75],
    [1.60, 1.40, 1.25, 1.20, 1.05],
    [2.15, 1.70, 1.45, 1.40, 1.25],
    [2.60, 2.35, 1.70, 1.60, 1.40],
    [3.25, 2.50, 1.95, 1.90, 1.70],
    [4.05, 2.65, 2.20, 2.15, 2.00],
    [4.80, 2.80, 2.50, 2.45, 2.30],
    [5.45, 3.10, 2.80, 2.75, 2.60],
    [6.10, 3.40, 3.10, 3.05, 2.90]
  ]

  // ✅ Pins pricing
  const pins = [
    [1.54, 1.26, 1.10, 0.99, 0.82],
    [1.76, 1.54, 1.38, 1.32, 1.16],
    [2.37, 1.87, 1.60, 1.54, 1.38],
    [2.86, 2.59, 1.87, 1.76, 1.54],
    [3.58, 2.92, 2.14, 2.09, 1.87],
    [4.46, 2.75, 2.42, 3.27, 2.20],
    [5.28, 3.08, 2.75, 2.70, 2.53],
    [6.00, 3.41, 3.08, 3.03, 2.86],
    [6.71, 3.74, 3.41, 3.36, 3.19]
  ]

  const data = []

  for (let color = 1; color <= 9; color++) {
    for (let i = 0; i < tiers.length; i++) {
      data.push({
        colorCount: color,
        qtyMin: tiers[i].min,
        qtyMax: tiers[i].max,
        productionPrice: production[color - 1][i],
        pinsPrice: pins[color - 1][i]
      })
    }
  }

  await prisma.printPrice.createMany({ data })

  console.log("✅ Seed complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
