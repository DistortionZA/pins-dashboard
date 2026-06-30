import { connection } from "next/server"
import BackLink from "@/components/BackLink"
import { getGarmentDirectoryData } from "../garments/data"
import CommercialInvoiceClient from "./CommercialInvoiceClient"
import { listCommercialInvoices } from "./data"
import type { CommercialInvoiceGarmentRecord } from "./types"

async function listInvoiceGarments(): Promise<CommercialInvoiceGarmentRecord[]> {
  try {
    const garments = await getGarmentDirectoryData()
    return garments.map((garment) => ({
      id: garment.id,
      code: garment.code,
      altCode: garment.altCode,
      brandName: garment.brandName,
      name: garment.name,
      color: garment.color,
      type: garment.type,
      tags: garment.tags,
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export default async function CommercialInvoicesPage() {
  await connection()
  const [data, garments] = await Promise.all([listCommercialInvoices(), listInvoiceGarments()])
  const initialData = { ...data, garments }

  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Sales Tools</p>
        <h1 className="hub-page-header-title">Commercial Invoice Generator</h1>
        <p className="hub-page-header-copy">
          Build editable commercial invoices from saved addresses, garment/product details, and manual shipment data.
        </p>
      </section>

      <CommercialInvoiceClient initialData={initialData} />
    </div>
  )
}
