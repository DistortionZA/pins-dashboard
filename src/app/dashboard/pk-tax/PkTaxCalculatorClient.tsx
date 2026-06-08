"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

export type AccountManagerEligibility = "eligible" | "contribution_only" | "excluded"

export type AccountManagerMonthlyInput = {
  id: number
  code?: "hardus" | "bux" | "justin" | "seth" | "shannon" | "johan"
  name: string
  eligibility: AccountManagerEligibility
  companyProfit: string
  snuggleProfit: string
  pkTax: string
  orders: string
  removable: boolean
}

export type AccountManagerResult = {
  id: number
  name: string
  eligibility: AccountManagerEligibility
  companyProfitShare: number
  snuggleProfitShare: number
  pkTaxShare: number
  ordersShare: number
  weightedScore: number
  initialCalculatedShare: number
  redistributedAdjustment: number
  finalPayoutGbp: number
  finalPayoutZar: number
  contributionOnlyRedistributed: boolean
}

export type PoolBreakdown = {
  exchangeRate: number
  totalCompanyProfit: number
  totalSnuggleProfit: number
  totalPkTax: number
  totalOrders: number
  eligibleSalesPkTax: number
  johanPkTaxKeptSeparate: number
  snuggleProfitPoolBase: number
  pkTaxPoolContribution: number
  epccRetained: number
  adminBankFees: number
  marketing: number
  operations: number
  snugglePoolContribution: number
  totalDistributablePool: number
  totalWeightedScore: number
  eligibleWeightedScoreTotal: number
  nonPayoutInitialTotal: number
  totalRedistributedAmount: number
  totalFinalPayoutGbp: number
  totalFinalPayoutZar: number
  remainingDifference: number
}

type MetricTotals = {
  companyProfit: number
  snuggleProfit: number
  pkTax: number
  orders: number
}

const COMPANY_PROFIT_WEIGHT = 0.4
const SNUGGLE_PROFIT_WEIGHT = 0.25
const PK_TAX_WEIGHT = 0.2
const ORDERS_WEIGHT = 0.15
const DEFAULT_EXCHANGE_RATE = "21"

const ELIGIBILITY_LABELS: Record<AccountManagerEligibility, string> = {
  eligible: "Eligible payout recipient",
  contribution_only: "Contribution only",
  excluded: "Excluded",
}

const REPORT_SOURCES = [
  "Netsuite PK Tax Report -> Enter PK Tax per person. Johan's PK Tax is tracked for contribution percentage only and excluded from the distributable pool.",
  "Netsuite Profit Report -> Enter normal company profit per person, excluding PK Tax.",
  "Snuggle Report -> Enter Snuggle profit per person. Shannon's tour jobs should already be excluded before entry.",
  "Netsuite Order Snapshot -> Enter number of orders processed per person.",
]

function createDefaultRows(): AccountManagerMonthlyInput[] {
  return [
    createRow(1, "Hardus", "eligible", false, "hardus"),
    createRow(2, "Bux", "eligible", false, "bux"),
    createRow(3, "Justin", "eligible", false, "justin"),
    createRow(4, "Seth", "eligible", false, "seth"),
    createRow(5, "Shannon", "contribution_only", false, "shannon"),
    createRow(6, "Johan", "contribution_only", false, "johan"),
  ]
}

function createRow(
  id: number,
  name = "",
  eligibility: AccountManagerEligibility = "excluded",
  removable = true,
  code?: AccountManagerMonthlyInput["code"]
): AccountManagerMonthlyInput {
  return {
    id,
    code,
    name,
    eligibility,
    companyProfit: "",
    snuggleProfit: "",
    pkTax: "",
    orders: "",
    removable,
  }
}

function parseCurrencyInput(value: string) {
  if (!value.trim()) {
    return 0
  }

  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function parseOrdersInput(value: string) {
  if (!value.trim()) {
    return 0
  }

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function clampNumberInput(value: string, wholeNumber = false) {
  if (value === "") {
    return ""
  }

  const parsed = wholeNumber ? Number.parseInt(value, 10) : Number.parseFloat(value)
  if (!Number.isFinite(parsed)) {
    return ""
  }

  return String(Math.max(0, wholeNumber ? Math.trunc(parsed) : parsed))
}

function getShare(value: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return value / total
}

function formatCurrencyGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCurrencyZar(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "-9999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
}

function getInputClassName() {
  return "w-full rounded-xl border border-zinc-800 bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
}

function getIncludedRows(rows: AccountManagerMonthlyInput[]) {
  return rows.filter((row) => row.eligibility !== "excluded")
}

export default function PkTaxCalculatorClient() {
  const [monthLabel, setMonthLabel] = useState("")
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE)
  const [snuggleProfitOverride, setSnuggleProfitOverride] = useState("")
  const [rows, setRows] = useState<AccountManagerMonthlyInput[]>(createDefaultRows)
  const [nextRowId, setNextRowId] = useState(7)

  const exchangeRateValue = parseCurrencyInput(exchangeRate) || 21
  const includedRows = useMemo(() => getIncludedRows(rows), [rows])
  const eligibleRows = useMemo(
    () => includedRows.filter((row) => row.eligibility === "eligible"),
    [includedRows]
  )
  const contributionOnlyRows = useMemo(
    () => includedRows.filter((row) => row.eligibility === "contribution_only"),
    [includedRows]
  )

  const totals = useMemo<MetricTotals>(() => {
    return includedRows.reduce<MetricTotals>(
      (accumulator, row) => {
        accumulator.companyProfit += parseCurrencyInput(row.companyProfit)
        accumulator.snuggleProfit += parseCurrencyInput(row.snuggleProfit)
        accumulator.pkTax += parseCurrencyInput(row.pkTax)
        accumulator.orders += parseOrdersInput(row.orders)
        return accumulator
      },
      {
        companyProfit: 0,
        snuggleProfit: 0,
        pkTax: 0,
        orders: 0,
      }
    )
  }, [includedRows])

  const eligibleSalesPkTax = useMemo(() => {
    return eligibleRows.reduce((sum, row) => sum + parseCurrencyInput(row.pkTax), 0)
  }, [eligibleRows])

  const johanPkTaxKeptSeparate = useMemo(() => {
    return includedRows.reduce((sum, row) => {
      if (row.code !== "johan") {
        return sum
      }

      return sum + parseCurrencyInput(row.pkTax)
    }, 0)
  }, [includedRows])

  const snuggleProfitPoolBase = useMemo(() => {
    const override = parseCurrencyInput(snuggleProfitOverride)
    return override > 0 ? override : totals.snuggleProfit
  }, [snuggleProfitOverride, totals.snuggleProfit])

  const poolBase = useMemo(() => {
    const pkTaxPoolContribution = eligibleSalesPkTax * 0.4
    const snugglePoolContribution = snuggleProfitPoolBase * 0.07
    return {
      pkTaxPoolContribution,
      epccRetained: eligibleSalesPkTax * 0.4,
      adminBankFees: eligibleSalesPkTax * 0.1,
      marketing: eligibleSalesPkTax * 0.05,
      operations: eligibleSalesPkTax * 0.05,
      snugglePoolContribution,
      totalDistributablePool: pkTaxPoolContribution + snugglePoolContribution,
    }
  }, [eligibleSalesPkTax, snuggleProfitPoolBase])

  const results = useMemo<AccountManagerResult[]>(() => {
    const preliminary = includedRows.map((row) => {
      const companyProfitShare = getShare(
        parseCurrencyInput(row.companyProfit),
        totals.companyProfit
      )
      const snuggleProfitShare = getShare(
        parseCurrencyInput(row.snuggleProfit),
        totals.snuggleProfit
      )
      const pkTaxShare = getShare(parseCurrencyInput(row.pkTax), totals.pkTax)
      const ordersShare = getShare(parseOrdersInput(row.orders), totals.orders)
      const weightedScore =
        companyProfitShare * COMPANY_PROFIT_WEIGHT +
        snuggleProfitShare * SNUGGLE_PROFIT_WEIGHT +
        pkTaxShare * PK_TAX_WEIGHT +
        ordersShare * ORDERS_WEIGHT

      return {
        id: row.id,
        name: row.name || `Row ${row.id}`,
        eligibility: row.eligibility,
        companyProfitShare,
        snuggleProfitShare,
        pkTaxShare,
        ordersShare,
        weightedScore,
        initialCalculatedShare: poolBase.totalDistributablePool * weightedScore,
      }
    })

    const eligibleWeightedScoreTotal = preliminary
      .filter((row) => row.eligibility === "eligible")
      .reduce((sum, row) => sum + row.weightedScore, 0)

    const nonPayoutInitialTotal = preliminary
      .filter((row) => row.eligibility === "contribution_only")
      .reduce((sum, row) => sum + row.initialCalculatedShare, 0)

    return preliminary.map((row) => {
      if (row.eligibility === "contribution_only") {
        return {
          ...row,
          redistributedAdjustment: -row.initialCalculatedShare,
          finalPayoutGbp: 0,
          finalPayoutZar: 0,
          contributionOnlyRedistributed: true,
        }
      }

      if (row.eligibility !== "eligible") {
        return {
          ...row,
          redistributedAdjustment: 0,
          finalPayoutGbp: 0,
          finalPayoutZar: 0,
          contributionOnlyRedistributed: false,
        }
      }

      const redistributionShare =
        eligibleWeightedScoreTotal > 0 ? row.weightedScore / eligibleWeightedScoreTotal : 0
      const redistributedAdjustment = nonPayoutInitialTotal * redistributionShare
      const finalPayoutGbp = row.initialCalculatedShare + redistributedAdjustment

      return {
        ...row,
        redistributedAdjustment,
        finalPayoutGbp,
        finalPayoutZar: finalPayoutGbp * exchangeRateValue,
        contributionOnlyRedistributed: false,
      }
    })
  }, [exchangeRateValue, includedRows, poolBase.totalDistributablePool, totals])

  const breakdown = useMemo<PoolBreakdown>(() => {
    const totalWeightedScore = results.reduce((sum, row) => sum + row.weightedScore, 0)
    const eligibleWeightedScoreTotal = results
      .filter((row) => row.eligibility === "eligible")
      .reduce((sum, row) => sum + row.weightedScore, 0)
    const nonPayoutInitialTotal = results
      .filter((row) => row.eligibility === "contribution_only")
      .reduce((sum, row) => sum + row.initialCalculatedShare, 0)
    const totalRedistributedAmount = results
      .filter((row) => row.eligibility === "eligible")
      .reduce((sum, row) => sum + row.redistributedAdjustment, 0)
    const totalFinalPayoutGbp = results
      .filter((row) => row.eligibility === "eligible")
      .reduce((sum, row) => sum + row.finalPayoutGbp, 0)
    const totalFinalPayoutZar = results
      .filter((row) => row.eligibility === "eligible")
      .reduce((sum, row) => sum + row.finalPayoutZar, 0)

    return {
      exchangeRate: exchangeRateValue,
      totalCompanyProfit: totals.companyProfit,
      totalSnuggleProfit: totals.snuggleProfit,
      totalPkTax: totals.pkTax,
      totalOrders: totals.orders,
      eligibleSalesPkTax,
      johanPkTaxKeptSeparate,
      snuggleProfitPoolBase,
      pkTaxPoolContribution: poolBase.pkTaxPoolContribution,
      epccRetained: poolBase.epccRetained,
      adminBankFees: poolBase.adminBankFees,
      marketing: poolBase.marketing,
      operations: poolBase.operations,
      snugglePoolContribution: poolBase.snugglePoolContribution,
      totalDistributablePool: poolBase.totalDistributablePool,
      totalWeightedScore,
      eligibleWeightedScoreTotal,
      nonPayoutInitialTotal,
      totalRedistributedAmount,
      totalFinalPayoutGbp,
      totalFinalPayoutZar,
      remainingDifference: poolBase.totalDistributablePool - totalFinalPayoutGbp,
    }
  }, [
    eligibleSalesPkTax,
    exchangeRateValue,
    johanPkTaxKeptSeparate,
    poolBase,
    results,
    snuggleProfitPoolBase,
    totals,
  ])

  const hasZeroMetricTotal =
    totals.companyProfit === 0 ||
    totals.snuggleProfit === 0 ||
    totals.pkTax === 0 ||
    totals.orders === 0

  const noEligibleWeightedScore =
    eligibleRows.length > 0 &&
    breakdown.totalDistributablePool > 0 &&
    breakdown.eligibleWeightedScoreTotal === 0

  function updateRow(
    id: number,
    field: keyof Omit<AccountManagerMonthlyInput, "id" | "code" | "removable">,
    value: string
  ) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== id) {
          return row
        }

        if (field === "name") {
          return { ...row, name: value }
        }

        if (field === "eligibility") {
          return { ...row, eligibility: value as AccountManagerEligibility }
        }

        if (field === "orders") {
          return { ...row, orders: clampNumberInput(value, true) }
        }

        return { ...row, [field]: clampNumberInput(value) }
      })
    )
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createRow(nextRowId)])
    setNextRowId((currentId) => currentId + 1)
  }

  function removeRow(id: number) {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id))
  }

  function resetCalculator() {
    setMonthLabel("")
    setExchangeRate(DEFAULT_EXCHANGE_RATE)
    setSnuggleProfitOverride("")
    setRows(createDefaultRows())
    setNextRowId(7)
    toast.success("PK Tax calculator reset.")
  }

  async function handleCopySummary() {
    const eligibleNames = eligibleRows.map((row) => row.name || `Row ${row.id}`).join(", ") || "None"
    const contributionOnlyNames =
      contributionOnlyRows.map((row) => row.name || `Row ${row.id}`).join(", ") || "None"

    const summaryLines = [
      `Month: ${monthLabel.trim() || "Not set"}`,
      `Exchange Rate: £1 = R${breakdown.exchangeRate.toFixed(2)}`,
      `Eligible Payout Recipients: ${eligibleNames}`,
      `Contribution-Only People: ${contributionOnlyNames}`,
      `Eligible Sales Team PK Tax Total: ${formatCurrencyGbp(breakdown.eligibleSalesPkTax)}`,
      `Johan PK Tax Kept Separate: ${formatCurrencyGbp(breakdown.johanPkTaxKeptSeparate)}`,
      "PK Tax Allocation Breakdown:",
      `- Account Manager Pool Allocation (40%): ${formatCurrencyGbp(
        breakdown.pkTaxPoolContribution
      )}`,
      `- EPCC Retained (40%): ${formatCurrencyGbp(breakdown.epccRetained)}`,
      `- Admin / Bank Fees (10%): ${formatCurrencyGbp(breakdown.adminBankFees)}`,
      `- Marketing (5%): ${formatCurrencyGbp(breakdown.marketing)}`,
      `- Operations (5%): ${formatCurrencyGbp(breakdown.operations)}`,
      `Snuggle Profit Total Used For Pool: ${formatCurrencyGbp(breakdown.snuggleProfitPoolBase)}`,
      `Snuggle Pool Contribution (7%): ${formatCurrencyGbp(breakdown.snugglePoolContribution)}`,
      `Total Distributable Pool: ${formatCurrencyGbp(breakdown.totalDistributablePool)}`,
      "Weighted Contribution Scores:",
      ...results.map(
        (row) => `- ${row.name}: ${formatPercent(row.weightedScore)} (${ELIGIBILITY_LABELS[row.eligibility]})`
      ),
      "Eligible Recipient Final Payouts:",
      ...results
        .filter((row) => row.eligibility === "eligible")
        .map(
          (row) =>
            `- ${row.name}: ${formatCurrencyGbp(row.finalPayoutGbp)} / ${formatCurrencyZar(
              row.finalPayoutZar
            )}`
        ),
      `Total Redistributed Amount: ${formatCurrencyGbp(breakdown.totalRedistributedAmount)}`,
      `Total Final Payout GBP: ${formatCurrencyGbp(breakdown.totalFinalPayoutGbp)}`,
      `Total Final Payout ZAR: ${formatCurrencyZar(breakdown.totalFinalPayoutZar)}`,
    ]

    try {
      await copyToClipboard(summaryLines.join("\n"))
      toast.success("PK Tax summary copied.")
    } catch {
      toast.error("Failed to copy PK Tax summary.")
    }
  }

  const inputClassName = getInputClassName()

  return (
    <div className="space-y-6">
      {/* <section className="rounded-3xl border border-red-500/20 bg-[#0b0c10] p-6 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">Manual Process</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">How contribution and payout differ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Contribution percentages include Hardus, Bux, Justin, Seth, Shannon, and Johan so
              the weighted scores are based on the full monthly totals. Only Hardus, Bux, Justin,
              and Seth receive a final payout. Shannon and Johan are contribution-only, so their
              calculated shares are redistributed across the eligible sales team.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-[#12131a] p-4 text-sm text-zinc-300">
            <p className="font-semibold text-white">Weightings</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span>Company Profit</span>
                <span>40%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Snuggle Profit</span>
                <span>25%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PK Tax</span>
                <span>20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Orders</span>
                <span>15%</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Monthly Pool Inputs
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-200">Month Label</span>
              <input
                type="text"
                value={monthLabel}
                onChange={(event) => setMonthLabel(event.target.value)}
                placeholder="May 2026"
                className={inputClassName}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-200">Exchange Rate</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={exchangeRate}
                onChange={(event) => setExchangeRate(clampNumberInput(event.target.value))}
                className={inputClassName}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-zinc-200">
                Optional Total Snuggle Profit Override
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={snuggleProfitOverride}
                onChange={(event) => setSnuggleProfitOverride(clampNumberInput(event.target.value))}
                placeholder="Leave blank to use included row totals"
                className={inputClassName}
              />
            </label>
          </div>
          {/* <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-100/90">
            For the Snuggle report, Shannon&apos;s tour jobs should be excluded before entering
            figures here. This is handled during the Monday export, not inside this calculator.
          </div> */}
        </div>

        {/* <div className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Report Sources
          </p>
          <div className="mt-4 space-y-3">
            {REPORT_SOURCES.map((source) => (
              <div
                key={source}
                className="rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3 text-sm leading-6 text-zinc-300"
              >
                {source}
              </div>
            ))}
          </div>
        </div> */}
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
              Account Manager Inputs
            </p>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Keep the default named rows for the main team. Additional rows can be added if you
              need to test exclusions or temporary contributors without changing the base setup.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-500/50 hover:bg-red-500/15"
          >
            Add Row
          </button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Eligibility</th>
                <th className="px-3 py-2">Company Profit</th>
                <th className="px-3 py-2">Snuggle Profit</th>
                <th className="px-3 py-2">PK Tax</th>
                <th className="px-3 py-2">Orders</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-[#12131a] text-zinc-200">
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateRow(row.id, "name", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={row.eligibility}
                      onChange={(event) => updateRow(row.id, "eligibility", event.target.value)}
                      className={inputClassName}
                    >
                      {Object.entries(ELIGIBILITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.companyProfit}
                      onChange={(event) => updateRow(row.id, "companyProfit", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.snuggleProfit}
                      onChange={(event) => updateRow(row.id, "snuggleProfit", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.pkTax}
                      onChange={(event) => updateRow(row.id, "pkTax", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.orders}
                      onChange={(event) => updateRow(row.id, "orders", event.target.value)}
                      className={inputClassName}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {row.removable ? (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                        Default
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Results</p>
            <p className="mt-2 text-sm text-zinc-400">
              Included rows appear below. Contribution-only rows show a zero final payout because
              their calculated share is redistributed across the eligible sales team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-500/50 hover:bg-red-500/15"
            >
              Copy Summary
            </button>
            <button
              type="button"
              onClick={resetCalculator}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {hasZeroMetricTotal ? (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
            One or more report totals are zero, so that metric weighting cannot be distributed.
          </div>
        ) : null}

        {noEligibleWeightedScore ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100/90">
            No eligible weighted score exists to distribute the pool.
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Eligibility</th>
                <th className="px-3 py-2">Company Profit %</th>
                <th className="px-3 py-2">Snuggle Profit %</th>
                <th className="px-3 py-2">PK Tax %</th>
                <th className="px-3 py-2">Orders %</th>
                <th className="px-3 py-2">Weighted Score %</th>
                <th className="px-3 py-2">Initial Share GBP</th>
                <th className="px-3 py-2">Redistributed GBP</th>
                <th className="px-3 py-2">Final Payout GBP</th>
                <th className="px-3 py-2">Final Payout ZAR</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-[#12131a] text-zinc-200">
                  <td className="px-3 py-3 font-semibold text-white">
                    <div className="flex flex-col gap-2">
                      <span>{row.name}</span>
                      {row.contributionOnlyRedistributed ? (
                        <span className="inline-flex w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                          Contribution only - redistributed
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-300">{ELIGIBILITY_LABELS[row.eligibility]}</td>
                  <td className="px-3 py-3">{formatPercent(row.companyProfitShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.snuggleProfitShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.pkTaxShare)}</td>
                  <td className="px-3 py-3">{formatPercent(row.ordersShare)}</td>
                  <td className="px-3 py-3 font-semibold text-white">
                    {formatPercent(row.weightedScore)}
                  </td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.initialCalculatedShare)}</td>
                  <td className="px-3 py-3">{formatCurrencyGbp(row.redistributedAdjustment)}</td>
                  <td className="px-3 py-3 font-semibold text-white">
                    {formatCurrencyGbp(row.finalPayoutGbp)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-white">
                    {formatCurrencyZar(row.finalPayoutZar)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Allocation Breakdown
          </p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#12131a] p-4">
              <p className="text-sm font-semibold text-white">A. Netsuite PK Tax Allocation</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Eligible sales team PK Tax total</span>
                  <span>{formatCurrencyGbp(breakdown.eligibleSalesPkTax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Account manager pool allocation, 40%</span>
                  <span>{formatCurrencyGbp(breakdown.pkTaxPoolContribution)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>EPCC retained, 40%</span>
                  <span>{formatCurrencyGbp(breakdown.epccRetained)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin / bank fees, 10%</span>
                  <span>{formatCurrencyGbp(breakdown.adminBankFees)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Marketing, 5%</span>
                  <span>{formatCurrencyGbp(breakdown.marketing)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Operations, 5%</span>
                  <span>{formatCurrencyGbp(breakdown.operations)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
                  <span>Johan PK Tax kept separate</span>
                  <span>{formatCurrencyGbp(breakdown.johanPkTaxKeptSeparate)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#12131a] p-4">
              <p className="text-sm font-semibold text-white">B. Snuggle Pool Contribution</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Total included Snuggle profit</span>
                  <span>{formatCurrencyGbp(breakdown.totalSnuggleProfit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Snuggle pool base used</span>
                  <span>{formatCurrencyGbp(breakdown.snuggleProfitPoolBase)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Snuggle pool contribution, 7%</span>
                  <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-semibold text-white">C. Final Distributable Pool</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-200">
                <div className="flex items-center justify-between">
                  <span>PK Tax pool contribution</span>
                  <span>{formatCurrencyGbp(breakdown.pkTaxPoolContribution)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Snuggle pool contribution</span>
                  <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-red-500/20 pt-2 font-semibold text-white">
                  <span>Total distributable pool</span>
                  <span>{formatCurrencyGbp(breakdown.totalDistributablePool)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-[#0b0c10] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
            Totals And Checks
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total company profit used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalCompanyProfit)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total Snuggle profit used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalSnuggleProfit)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total PK Tax used for percentages</span>
              <span>{formatCurrencyGbp(breakdown.totalPkTax)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total orders used for percentages</span>
              <span>{breakdown.totalOrders.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Eligible sales team PK Tax used for the pool</span>
              <span>{formatCurrencyGbp(breakdown.eligibleSalesPkTax)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Johan PK Tax kept separate</span>
              <span>{formatCurrencyGbp(breakdown.johanPkTaxKeptSeparate)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>PK Tax pool contribution at 40%</span>
              <span>{formatCurrencyGbp(breakdown.pkTaxPoolContribution)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Snuggle pool contribution at 7%</span>
              <span>{formatCurrencyGbp(breakdown.snugglePoolContribution)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-white">
              <span>Total distributable pool GBP</span>
              <span>{formatCurrencyGbp(breakdown.totalDistributablePool)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total initial contribution-only calculated share</span>
              <span>{formatCurrencyGbp(breakdown.nonPayoutInitialTotal)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total redistributed amount</span>
              <span>{formatCurrencyGbp(breakdown.totalRedistributedAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total final payout GBP</span>
              <span>{formatCurrencyGbp(breakdown.totalFinalPayoutGbp)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Total final payout ZAR</span>
              <span>{formatCurrencyZar(breakdown.totalFinalPayoutZar)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3">
              <span>Remaining / rounding difference against total distributable pool</span>
              <span>{formatCurrencyGbp(breakdown.remainingDifference)}</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-[#12131a] px-4 py-3 text-sm leading-6 text-zinc-300">
              <p>Total weighted score for included contributors: {formatPercent(breakdown.totalWeightedScore)}</p>
              <p className="mt-2">
                Total final payout to eligible recipients should equal the total distributable
                pool, allowing for small rounding differences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
