export type CommercialInvoiceAddressSnapshot = {
  id: string
  label: string
  companyName: string
  contactName: string
  address: string
  country: string
  eori: string
  vat: string
  ein: string
  telephone: string
}

export type CommercialInvoiceDetailsPayload = {
  reference: string
  date: string
  shipDate: string
  tracking: string
  boxCount: string
  weight: string
  currency: "GBP" | "EUR"
  dutiesPayableBy: "" | "Sender" | "Receiver"
}

export type CommercialInvoiceLinePayload = {
  id: string
  product: string
  designName: string
  type: string
  description: string
  cost: string
  quantity: string
  commodityCode: string
  countryOfOrigin: string
}

export type CommercialInvoicePayload = {
  title?: string
  details: CommercialInvoiceDetailsPayload
  sender: CommercialInvoiceAddressSnapshot
  receiver: CommercialInvoiceAddressSnapshot
  lineItems: CommercialInvoiceLinePayload[]
}

export type SavedCommercialInvoiceSummary = {
  id: string
  title: string | null
  invoiceNumber: string
  reference: string | null
  invoiceDate: string | null
  updatedAt: string
  invoiceTotal: string
  totalQuantity: number
}

export type SavedCommercialInvoiceRecord = SavedCommercialInvoiceSummary & {
  details: CommercialInvoiceDetailsPayload
  sender: CommercialInvoiceAddressSnapshot
  receiver: CommercialInvoiceAddressSnapshot
  lineItems: CommercialInvoiceLinePayload[]
}

export type CommercialInvoicesData = {
  invoices: SavedCommercialInvoiceSummary[]
  setupIssue?: string
}

export type CommercialInvoiceActionResult = {
  ok: boolean
  message: string
  invoice?: SavedCommercialInvoiceRecord
  invoices?: SavedCommercialInvoiceSummary[]
}
