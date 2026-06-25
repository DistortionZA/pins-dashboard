import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import type {
  CommercialInvoiceAddressSnapshot,
  CommercialInvoicesData,
  SavedCommercialInvoiceRecord,
  SavedCommercialInvoiceSummary,
} from "./types"

const COMMERCIAL_INVOICES_TAG = "commercial-invoices"

type CommercialInvoiceRow = {
  id: string
  title: string | null
  invoiceNumber: string
  reference: string | null
  invoiceDate: Date | null
  shipDate: Date | null
  tracking: string | null
  boxCount: number | null
  weight: string | null
  currency: string
  dutiesPayableBy: string | null
  senderJson: Prisma.JsonValue
  receiverJson: Prisma.JsonValue
  totalQuantity: number
  invoiceTotal: Prisma.Decimal
  updatedAt: Date
  lines: CommercialInvoiceLineRow[]
}

type CommercialInvoiceLineRow = {
  id: string
  product: string | null
  designName: string | null
  productType: string | null
  description: string | null
  unitCost: Prisma.Decimal
  quantity: number
  lineTotal: Prisma.Decimal
  commodityCode: string | null
  countryOfOrigin: string | null
  sortOrder: number
}

function hasCommercialInvoiceDelegate() {
  const client = prisma as typeof prisma & {
    commercialInvoice?: { findMany?: (...args: unknown[]) => unknown; findUnique?: (...args: unknown[]) => unknown }
  }

  return typeof client.commercialInvoice?.findMany === "function"
}

export function getCommercialInvoicesTag() {
  return COMMERCIAL_INVOICES_TAG
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function normalizeAddress(value: Prisma.JsonValue): CommercialInvoiceAddressSnapshot {
  const address = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {}

  return {
    id: asString(address.id),
    label: asString(address.label),
    companyName: asString(address.companyName),
    contactName: asString(address.contactName),
    address: asString(address.address),
    country: asString(address.country),
    eori: asString(address.eori),
    vat: asString(address.vat),
    ein: asString(address.ein),
    telephone: asString(address.telephone),
  }
}

function serializeSummary(row: CommercialInvoiceRow): SavedCommercialInvoiceSummary {
  return {
    id: row.id,
    title: row.title,
    invoiceNumber: row.invoiceNumber,
    reference: row.reference,
    invoiceDate: row.invoiceDate?.toISOString().slice(0, 10) ?? null,
    updatedAt: row.updatedAt.toISOString(),
    invoiceTotal: row.invoiceTotal.toString(),
    totalQuantity: row.totalQuantity,
  }
}

function serializeInvoice(row: CommercialInvoiceRow): SavedCommercialInvoiceRecord {
  return {
    ...serializeSummary(row),
    details: {
      reference: row.invoiceNumber,
      date: row.invoiceDate?.toISOString().slice(0, 10) ?? "",
      shipDate: row.shipDate?.toISOString().slice(0, 10) ?? "",
      tracking: row.tracking ?? "",
      boxCount: row.boxCount?.toString() ?? "",
      weight: row.weight ?? "",
      currency: row.currency === "EUR" ? "EUR" : "GBP",
      dutiesPayableBy: row.dutiesPayableBy === "Sender" || row.dutiesPayableBy === "Receiver" ? row.dutiesPayableBy : "",
    },
    sender: normalizeAddress(row.senderJson),
    receiver: normalizeAddress(row.receiverJson),
    lineItems: row.lines
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((line) => ({
        id: line.id,
        product: line.product ?? "",
        designName: line.designName ?? "",
        type: line.productType ?? "",
        description: line.description ?? "",
        cost: line.unitCost.toString(),
        quantity: line.quantity.toString(),
        commodityCode: line.commodityCode ?? "",
        countryOfOrigin: line.countryOfOrigin ?? "",
      })),
  }
}

async function loadCommercialInvoices(): Promise<CommercialInvoicesData> {
  if (!hasCommercialInvoiceDelegate()) {
    return {
      invoices: [],
      setupIssue:
        "The running Prisma client does not include CommercialInvoice yet. Generate Prisma client and apply the migration before saving invoices.",
    }
  }

  try {
    const invoices = await prisma.commercialInvoice.findMany({
      orderBy: { updatedAt: "desc" },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    })

    return { invoices: invoices.map(serializeSummary) }
  } catch (error) {
    console.error(error)
    return {
      invoices: [],
      setupIssue: "Saved commercial invoices could not be loaded. Check database connection and migrations.",
    }
  }
}

export const listCommercialInvoices = unstable_cache(loadCommercialInvoices, ["commercial-invoices"], {
  tags: [COMMERCIAL_INVOICES_TAG],
})

export async function getCommercialInvoice(id: string): Promise<SavedCommercialInvoiceRecord | null> {
  if (!hasCommercialInvoiceDelegate()) return null

  const invoice = await prisma.commercialInvoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  })

  return invoice ? serializeInvoice(invoice) : null
}
