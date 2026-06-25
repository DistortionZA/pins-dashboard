"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

type Currency = "GBP" | "EUR"
type DutiesPayableBy = "" | "Sender" | "Receiver"

type Address = {
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

type InvoiceDetails = {
  reference: string
  date: string
  shipDate: string
  tracking: string
  boxCount: string
  weight: string
  currency: Currency
  dutiesPayableBy: DutiesPayableBy
}

type LineItem = {
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

type ExportLineItem = LineItem & {
  costValue: number
  quantityValue: number
  totalValue: number
}

type ExportData = {
  details: InvoiceDetails & { dutiesPayableBy: "Sender" | "Receiver" }
  sender: Address
  receiver: Address
  lineItems: ExportLineItem[]
  summary: {
    quantity: number
    total: number
  }
}

const EMPTY_ADDRESS: Address = {
  id: "",
  label: "",
  companyName: "",
  contactName: "",
  address: "",
  country: "",
  eori: "",
  vat: "",
  ein: "",
  telephone: "",
}

const STARTER_ADDRESSES: Address[] = [
  {
    id: "epcc",
    label: "EPCC",
    companyName: "EPCC",
    contactName: "",
    address: "",
    country: "United Kingdom",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
  {
    id: "sportimadok",
    label: "SPORTIMADOK",
    companyName: "SPORTIMADOK",
    contactName: "",
    address: "",
    country: "Hungary",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
  {
    id: "aaa-vans-ireland",
    label: "AAA Vans Ireland",
    companyName: "AAA Vans Ireland",
    contactName: "",
    address: "",
    country: "Ireland",
    eori: "",
    vat: "",
    ein: "",
    telephone: "",
  },
]

const today = new Date().toISOString().slice(0, 10)

const INITIAL_DETAILS: InvoiceDetails = {
  reference: "",
  date: today,
  shipDate: today,
  tracking: "",
  boxCount: "",
  weight: "",
  currency: "GBP",
  dutiesPayableBy: "",
}

const LINE_ITEM_HEADERS = [
  "Product",
  "Design Name",
  "Type",
  "Description",
  "Cost",
  "Qty",
  "Total",
  "Commodity Code",
  "Country of Origin",
]

function getId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

function normalizeAddress(address?: Partial<Address>): Address {
  return {
    id: address?.id ?? "",
    label: address?.label ?? "",
    companyName: address?.companyName ?? "",
    contactName: address?.contactName ?? "",
    address: address?.address ?? "",
    country: address?.country ?? "",
    eori: address?.eori ?? "",
    vat: address?.vat ?? "",
    ein: address?.ein ?? "",
    telephone: address?.telephone ?? "",
  }
}

function createLineItem(): LineItem {
  return {
    id: getId(),
    product: "",
    designName: "",
    type: "",
    description: "",
    cost: "",
    quantity: "",
    commodityCode: "",
    countryOfOrigin: "",
  }
}

function getLineTotal(item: LineItem) {
  const cost = Number.parseFloat(item.cost) || 0
  const quantity = Number.parseFloat(item.quantity) || 0

  return cost * quantity
}

function getQuantity(item: LineItem) {
  return Number.parseFloat(item.quantity) || 0
}

function getCost(item: LineItem) {
  return Number.parseFloat(item.cost) || 0
}

function hasLineItemContent(item: LineItem) {
  return [
    item.product,
    item.designName,
    item.type,
    item.description,
    item.cost,
    item.quantity,
    item.commodityCode,
    item.countryOfOrigin,
  ].some((value) => value.trim())
}

function hasValidLineItem(item: LineItem) {
  return Boolean(item.product.trim()) && getQuantity(item) > 0 && Number.isFinite(getCost(item))
}

function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function getCurrencyFormat(currency: Currency) {
  return currency === "GBP" ? "£#,##0.00" : "€#,##0.00"
}

function fieldId(prefix: string, field: keyof Address) {
  return `${prefix}-${field}`
}

function sanitizeFilenamePart(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return cleaned || today
}

function getBaseFilename(details: InvoiceDetails) {
  return `commercial-invoice-${sanitizeFilenamePart(details.reference || details.date)}`
}

function validateInvoice(details: InvoiceDetails, sender: Address, receiver: Address, lineItems: LineItem[]) {
  const errors: string[] = []

  if (!details.reference.trim()) errors.push("Invoice No / Reference is required.")
  if (!details.dutiesPayableBy) errors.push("Duties Payable By must be selected.")
  if (!sender.companyName.trim() || !sender.address.trim()) errors.push("Sender company name and address are required.")
  if (!receiver.companyName.trim() || !receiver.address.trim()) errors.push("Receiver company name and address are required.")
  if (!lineItems.some(hasLineItemContent)) errors.push("At least one line item is required.")
  else if (!lineItems.some(hasValidLineItem)) errors.push("At least one line item needs product, cost, and quantity.")

  return errors
}

function getAddressRows(address: Address) {
  return [
    ["Company", address.companyName],
    ["Contact", address.contactName],
    ["Address", address.address],
    ["Country", address.country],
    ["EORI", address.eori],
    ["VAT", address.vat],
    ["EIN", address.ein],
    ["Telephone", address.telephone],
  ]
}

function getAddressBlock(address: Address) {
  return getAddressRows(address)
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value}`)
}

function getExportData(
  details: InvoiceDetails,
  sender: Address,
  receiver: Address,
  lineItems: LineItem[],
  summary: ExportData["summary"],
): ExportData | null {
  if (!details.dutiesPayableBy) return null

  const exportLineItems = lineItems.filter(hasLineItemContent).map((item) => ({
    ...item,
    costValue: getCost(item),
    quantityValue: getQuantity(item),
    totalValue: getLineTotal(item),
  }))

  return {
    details: {
      ...details,
      dutiesPayableBy: details.dutiesPayableBy,
    },
    sender,
    receiver,
    lineItems: exportLineItems,
    summary,
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function AddressSection({
  title,
  address,
  selectedAddressId,
  onSelectAddress,
  onChangeAddress,
}: {
  title: string
  address: Address
  selectedAddressId: string
  onSelectAddress: (addressId: string) => void
  onChangeAddress: (field: keyof Address, value: string) => void
}) {
  const prefix = title.toLowerCase()

  return (
    <section className="hub-panel grid min-w-0 gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-brand-cream">{title}</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Select a saved address or enter the {title.toLowerCase()} details manually.
          </p>
        </div>
        <label className="grid w-full min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted sm:max-w-xs sm:flex-1">
          Saved Address
          <select
            value={selectedAddressId}
            onChange={(event) => onSelectAddress(event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm normal-case tracking-normal outline-none"
          >
            <option value="">Manual / unselected</option>
            {STARTER_ADDRESSES.map((savedAddress) => (
              <option key={savedAddress.id} value={savedAddress.id}>
                {savedAddress.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "companyName")}>
          Company Name
          <input
            id={fieldId(prefix, "companyName")}
            value={address.companyName}
            onChange={(event) => onChangeAddress("companyName", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "contactName")}>
          Contact Name
          <input
            id={fieldId(prefix, "contactName")}
            value={address.contactName}
            onChange={(event) => onChangeAddress("contactName", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "country")}>
          Country
          <input
            id={fieldId(prefix, "country")}
            value={address.country}
            onChange={(event) => onChangeAddress("country", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "telephone")}>
          Telephone
          <input
            id={fieldId(prefix, "telephone")}
            value={address.telephone}
            onChange={(event) => onChangeAddress("telephone", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream sm:col-span-2" htmlFor={fieldId(prefix, "address")}>
          Address
          <textarea
            id={fieldId(prefix, "address")}
            value={address.address}
            onChange={(event) => onChangeAddress("address", event.target.value)}
            rows={3}
            className="hub-input w-full min-w-0 resize-y rounded-xl px-3 py-2 text-sm leading-5 outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "eori")}>
          EORI
          <input
            id={fieldId(prefix, "eori")}
            value={address.eori}
            onChange={(event) => onChangeAddress("eori", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "vat")}>
          VAT
          <input
            id={fieldId(prefix, "vat")}
            value={address.vat}
            onChange={(event) => onChangeAddress("vat", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>

        <label className="grid min-w-0 gap-1.5 text-sm font-medium text-brand-cream" htmlFor={fieldId(prefix, "ein")}>
          EIN
          <input
            id={fieldId(prefix, "ein")}
            value={address.ein}
            onChange={(event) => onChangeAddress("ein", event.target.value)}
            className="hub-input w-full min-w-0 rounded-xl px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>
    </section>
  )
}

export default function CommercialInvoiceClient() {
  const [details, setDetails] = useState<InvoiceDetails>(INITIAL_DETAILS)
  const [senderAddressId, setSenderAddressId] = useState("")
  const [receiverAddressId, setReceiverAddressId] = useState("")
  const [sender, setSender] = useState<Address>(EMPTY_ADDRESS)
  const [receiver, setReceiver] = useState<Address>(EMPTY_ADDRESS)
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const summary = useMemo(() => {
    return lineItems.reduce(
      (current, item) => ({
        quantity: current.quantity + getQuantity(item),
        total: current.total + getLineTotal(item),
      }),
      { quantity: 0, total: 0 },
    )
  }, [lineItems])

  function getValidatedExportData() {
    const errors = validateInvoice(details, sender, receiver, lineItems)
    setValidationErrors(errors)

    if (errors.length) {
      toast.error("Complete required invoice fields before export.")
      return null
    }

    return getExportData(details, sender, receiver, lineItems, summary)
  }

  async function handleExportExcel() {
    const exportData = getValidatedExportData()
    if (!exportData) return

    try {
      const ExcelJS = await import("exceljs")
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Commercial Invoice")
      const currencyFormat = getCurrencyFormat(exportData.details.currency)

      worksheet.columns = [
        { width: 20 },
        { width: 24 },
        { width: 18 },
        { width: 28 },
        { width: 14 },
        { width: 10 },
        { width: 14 },
        { width: 22 },
        { width: 22 },
      ]

      worksheet.mergeCells("A1:I1")
      worksheet.getCell("A1").value = "Commercial Invoice"
      worksheet.getCell("A1").font = { bold: true, size: 16 }

      const detailRows = [
        ["Invoice No / Reference", exportData.details.reference],
        ["Date", exportData.details.date],
        ["Ship Date", exportData.details.shipDate],
        ["Tracking", exportData.details.tracking],
        ["Box Count", exportData.details.boxCount],
        ["Weight", exportData.details.weight],
        ["Currency", exportData.details.currency],
        ["Duties Payable By", exportData.details.dutiesPayableBy],
      ]

      detailRows.forEach((row, index) => {
        const excelRow = worksheet.getRow(index + 3)
        excelRow.values = row
        excelRow.getCell(1).font = { bold: true }
      })

      const senderStart = 13
      worksheet.getCell(`A${senderStart}`).value = "Sender"
      worksheet.getCell(`A${senderStart}`).font = { bold: true }
      getAddressRows(exportData.sender).forEach((row, index) => {
        const excelRow = worksheet.getRow(senderStart + index + 1)
        excelRow.values = row
        excelRow.getCell(1).font = { bold: true }
      })

      worksheet.getCell(`D${senderStart}`).value = "Receiver"
      worksheet.getCell(`D${senderStart}`).font = { bold: true }
      getAddressRows(exportData.receiver).forEach((row, index) => {
        const excelRow = worksheet.getRow(senderStart + index + 1)
        excelRow.getCell(4).value = row[0]
        excelRow.getCell(5).value = row[1]
        excelRow.getCell(4).font = { bold: true }
      })

      const tableHeaderRowNumber = senderStart + 11
      const tableHeaderRow = worksheet.getRow(tableHeaderRowNumber)
      tableHeaderRow.values = LINE_ITEM_HEADERS
      tableHeaderRow.font = { bold: true }

      exportData.lineItems.forEach((item, index) => {
        const row = worksheet.getRow(tableHeaderRowNumber + index + 1)
        row.values = [
          item.product,
          item.designName,
          item.type,
          item.description,
          item.costValue,
          item.quantityValue,
          item.totalValue,
          item.commodityCode,
          item.countryOfOrigin,
        ]
        row.getCell(5).numFmt = currencyFormat
        row.getCell(7).numFmt = currencyFormat
      })

      const totalRowNumber = tableHeaderRowNumber + exportData.lineItems.length + 2
      worksheet.getCell(`A${totalRowNumber}`).value = "Total Quantity"
      worksheet.getCell(`B${totalRowNumber}`).value = exportData.summary.quantity
      worksheet.getCell(`A${totalRowNumber + 1}`).value = "Final Invoice Total"
      worksheet.getCell(`B${totalRowNumber + 1}`).value = exportData.summary.total
      worksheet.getCell(`B${totalRowNumber + 1}`).numFmt = currencyFormat
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true }
      worksheet.getCell(`A${totalRowNumber + 1}`).font = { bold: true }

      const buffer = await workbook.xlsx.writeBuffer()
      downloadBlob(
        new Blob([buffer as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${getBaseFilename(exportData.details)}.xlsx`,
      )
      toast.success("Editable Excel invoice exported.")
    } catch {
      toast.error("Failed to export Excel invoice.")
    }
  }

  async function handleExportPdf() {
    const exportData = getValidatedExportData()
    if (!exportData) return

    try {
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Commercial Invoice", 40, 36)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const detailRows = [
        `Invoice No / Reference: ${exportData.details.reference}`,
        `Date: ${exportData.details.date}`,
        `Ship Date: ${exportData.details.shipDate}`,
        `Tracking: ${exportData.details.tracking}`,
        `Box Count: ${exportData.details.boxCount}`,
        `Weight: ${exportData.details.weight}`,
        `Currency: ${exportData.details.currency}`,
        `Duties Payable By: ${exportData.details.dutiesPayableBy}`,
      ]
      detailRows.forEach((row, index) => doc.text(row, 40, 58 + index * 13))

      doc.setFont("helvetica", "bold")
      doc.text("Sender", 330, 58)
      doc.text("Receiver", 570, 58)
      doc.setFont("helvetica", "normal")
      doc.text(getAddressBlock(exportData.sender), 330, 74, { maxWidth: 210 })
      doc.text(getAddressBlock(exportData.receiver), 570, 74, { maxWidth: 220 })

      autoTable(doc, {
        startY: 178,
        head: [LINE_ITEM_HEADERS],
        body: exportData.lineItems.map((item) => [
          item.product,
          item.designName,
          item.type,
          item.description,
          formatMoney(item.costValue, exportData.details.currency),
          item.quantityValue.toLocaleString("en-GB"),
          formatMoney(item.totalValue, exportData.details.currency),
          item.commodityCode,
          item.countryOfOrigin,
        ]),
        styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [32, 32, 32], textColor: [255, 255, 255] },
        columnStyles: {
          3: { cellWidth: 120 },
          7: { cellWidth: 82 },
          8: { cellWidth: 88 },
        },
        margin: { left: 40, right: 40 },
      })

      const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 420
      doc.setFont("helvetica", "bold")
      doc.text(`Total Quantity: ${exportData.summary.quantity.toLocaleString("en-GB")}`, 40, finalY + 24)
      doc.text(`Final Invoice Total: ${formatMoney(exportData.summary.total, exportData.details.currency)}`, 40, finalY + 40)

      doc.save(`${getBaseFilename(exportData.details)}.pdf`)
      toast.success("PDF invoice exported.")
    } catch {
      toast.error("Failed to export PDF invoice.")
    }
  }

  function updateDetails<Field extends keyof InvoiceDetails>(field: Field, value: InvoiceDetails[Field]) {
    setDetails((current) => ({ ...current, [field]: value }))
  }

  function selectAddress(addressId: string, target: "sender" | "receiver") {
    const selectedAddress = normalizeAddress(STARTER_ADDRESSES.find((address) => address.id === addressId))

    if (target === "sender") {
      setSenderAddressId(addressId)
      setSender(selectedAddress)
      return
    }

    setReceiverAddressId(addressId)
    setReceiver(selectedAddress)
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string) {
    setLineItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  function removeLineItem(id: string) {
    setLineItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  function handleSavePlaceholder() {
    toast.info("Invoice saving/loading is planned for a later database-backed stage.")
  }

  return (
    <div className="grid gap-4">
      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Invoice Details</h2>
            <p className="mt-1 text-sm text-brand-muted">Duties payer must be selected for every invoice.</p>
          </div>
          <span className="rounded-full border border-brand-border bg-brand-panel-alt/70 px-3 py-1 text-xs font-medium text-brand-muted">
            Manual V1
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-reference">
            Invoice No / Reference
            <input
              id="invoice-reference"
              value={details.reference}
              onChange={(event) => updateDetails("reference", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-date">
            Date
            <input
              id="invoice-date"
              type="date"
              value={details.date}
              onChange={(event) => updateDetails("date", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-ship-date">
            Ship Date
            <input
              id="invoice-ship-date"
              type="date"
              value={details.shipDate}
              onChange={(event) => updateDetails("shipDate", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-tracking">
            Tracking
            <input
              id="invoice-tracking"
              value={details.tracking}
              onChange={(event) => updateDetails("tracking", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-box-count">
            Box Count
            <input
              id="invoice-box-count"
              inputMode="numeric"
              value={details.boxCount}
              onChange={(event) => updateDetails("boxCount", event.target.value)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-weight">
            Weight
            <input
              id="invoice-weight"
              value={details.weight}
              onChange={(event) => updateDetails("weight", event.target.value)}
              placeholder="Example: 18 kg"
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-currency">
            Currency
            <select
              id="invoice-currency"
              value={details.currency}
              onChange={(event) => updateDetails("currency", event.target.value as Currency)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-brand-cream" htmlFor="invoice-duties">
            Duties Payable By
            <select
              id="invoice-duties"
              value={details.dutiesPayableBy}
              onChange={(event) => updateDetails("dutiesPayableBy", event.target.value as DutiesPayableBy)}
              className="hub-input rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">Select payer</option>
              <option value="Sender">Sender</option>
              <option value="Receiver">Receiver</option>
            </select>
            {!details.dutiesPayableBy ? (
              <span className="text-xs font-medium text-brand-red/90">Required. Do not leave duties payer unselected.</span>
            ) : null}
          </label>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <AddressSection
          title="Sender"
          address={sender}
          selectedAddressId={senderAddressId}
          onSelectAddress={(addressId) => selectAddress(addressId, "sender")}
          onChangeAddress={(field, value) => setSender((current) => ({ ...current, [field]: value }))}
        />
        <AddressSection
          title="Receiver"
          address={receiver}
          selectedAddressId={receiverAddressId}
          onSelectAddress={(addressId) => selectAddress(addressId, "receiver")}
          onChangeAddress={(field, value) => setReceiver((current) => ({ ...current, [field]: value }))}
        />
      </div>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Line Items</h2>
            <p className="mt-1 max-w-4xl text-sm text-brand-muted">
              Commodity code follows product type/material, not brand. Example: a 100% cotton T-shirt uses 6109100010 whether
              it is Gildan, AS Colour, or another brand. Country of origin follows the actual garment/product and where it was
              made. Keep both editable because they may come from different sources.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLineItems((current) => [...current, createLineItem()])}
            className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold"
          >
            Add Line
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-brand-border">
          <table className="min-w-[1280px] w-full border-collapse text-left text-sm">
            <thead className="bg-brand-panel-alt/80 text-xs uppercase tracking-[0.12em] text-brand-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 font-semibold">Design Name</th>
                <th className="px-3 py-2 font-semibold">Type / Material</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Cost</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Commodity Code (Product/Material/Type)</th>
                <th className="px-3 py-2 font-semibold">Country of Origin (Actual Garment)</th>
                <th className="px-3 py-2 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-t border-brand-border/70 align-top">
                  <td className="min-w-[150px] px-2 py-2">
                    <input
                      value={item.product}
                      onChange={(event) => updateLineItem(item.id, "product", event.target.value)}
                      placeholder="Example: T-shirt"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[150px] px-2 py-2">
                    <input
                      value={item.designName}
                      onChange={(event) => updateLineItem(item.id, "designName", event.target.value)}
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[140px] px-2 py-2">
                    <input
                      value={item.type}
                      onChange={(event) => updateLineItem(item.id, "type", event.target.value)}
                      placeholder="100% cotton"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[220px] px-2 py-2">
                    <input
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[110px] px-2 py-2">
                    <input
                      value={item.cost}
                      onChange={(event) => updateLineItem(item.id, "cost", event.target.value)}
                      inputMode="decimal"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[90px] px-2 py-2">
                    <input
                      value={item.quantity}
                      onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                      inputMode="decimal"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[120px] px-2 py-2">
                    <input
                      value={formatMoney(getLineTotal(item), details.currency)}
                      readOnly
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                  </td>
                  <td className="min-w-[210px] px-2 py-2">
                    <input
                      value={item.commodityCode}
                      onChange={(event) => updateLineItem(item.id, "commodityCode", event.target.value)}
                      placeholder="Example: 6109100010"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-brand-muted">Based on product/material/type, not brand.</p>
                  </td>
                  <td className="min-w-[210px] px-2 py-2">
                    <input
                      value={item.countryOfOrigin}
                      onChange={(event) => updateLineItem(item.id, "countryOfOrigin", event.target.value)}
                      placeholder="Actual garment origin"
                      className="hub-input w-full rounded-lg px-2.5 py-2 text-sm outline-none"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-brand-muted">Based on where this product was made.</p>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="hub-button-secondary rounded-full px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-cream">Saved Invoices</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Planned for reuse later: save invoice drafts and load previous invoices. Database-backed saving is not active in
              V1.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSavePlaceholder}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Save Draft Later
            </button>
            <button
              type="button"
              onClick={handleSavePlaceholder}
              className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold"
            >
              Load Saved Later
            </button>
          </div>
        </div>
      </section>

      <section className="hub-panel grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-cream">Summary / Export</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExportExcel} className="hub-button-primary rounded-full px-4 py-2 text-sm font-semibold">
              Export Editable Excel
            </button>
            <button type="button" onClick={handleExportPdf} className="hub-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
              Export PDF
            </button>
          </div>
        </div>

        {validationErrors.length ? (
          <div className="rounded-2xl border border-brand-red/45 bg-brand-red/10 px-4 py-3 text-sm text-brand-cream">
            <p className="font-semibold">Export blocked until required fields are complete:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-brand-muted">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-border bg-brand-panel-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Total Quantity</p>
            <p className="mt-1 text-2xl font-semibold text-brand-cream">{summary.quantity.toLocaleString("en-GB")}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-panel-alt/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Invoice Total</p>
            <p className="mt-1 text-2xl font-semibold text-brand-cream">{formatMoney(summary.total, details.currency)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
