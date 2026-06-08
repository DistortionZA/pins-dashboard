"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

export type AccountManagerMonthlyInput = {
  id: number
  name: string
  companyProfit: string
  snuggleProfit: string
  pkTax: string
  orders: string
}

export type AccountManagerResult = {
  id: number
  name: string
  companyProfitShare: number
  snuggleProfitShare: number
  pkTaxShare: number
  ordersShare: number
  weightedScore: number
  payout: number
}

export type PkTaxAllocationBreakdown = {
  accountManagerAllocation: number
  epccRetained: number
  adminBankFees: number
  marketing: number
  operations: number
  snugglePoolContribution: number
  totalAccountManagerBonusPool: number
}

export type MonthlyPkTaxSummary = {
  monthLabel: string
  totalNetsuitePkTax: number
  eligibleSnuggleProfit: number
  shannonTourJobsExcluded: number
  breakdown: PkTaxAllocationBreakdown
  totals: {
    companyProfit: number
    snuggleProfit: number
    pkTax: number
    orders: number
    totalWeightedScore: number
    totalPayout: number
    remainingDifference: number
  }
  results: AccountManagerResult[]
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

const INPUT_GUIDANCE = {
  companyProfit: "From Netsuite Profit Report.",
  snuggleProfit: "From Snuggle Report, excluding Shannon tour jobs.",
  pkTax: "From Netsuite PK Tax Report.",
  orders: "From Netsuite Order Snapshot.",
} as const

function createBlankRow(id: number): AccountManagerMonthlyInput {
  return {
    id,
    name: "",
    companyProfit: "",
    snuggleProfit: "",
    pkTax: "",
    orders: "",
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
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
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand("copy")
  document.body.removeChild(textArea)
}

function buildPkTaxBreakdown(
  totalNetsuitePkTax: number,
  eligibleSnuggleProfit: number
): PkTaxAllocationBreakdown {
  const accountManagerAllocation = totalNetsuitePkTax * 0.4
  const epccRetained = totalNetsuitePkTax * 0.4
  const adminBankFees = totalNetsuitePkTax * 0.1
  const marketing = totalNetsuitePkTax * 0.05
  const operations = totalNetsuitePkTax * 0.05
  const snugglePoolContribution = eligibleSnuggleProfit * 0.07

  return {
    accountManagerAllocation,
    epccRetained,
    adminBankFees,
    marketing,
    operations,
    snugglePoolContribution,
    totalAccountManagerBonusPool: accountManagerAllocation + snugglePoolContribution,
  }
}

export default function PkTaxCalculatorClient() {
  const [monthLabel, setMonthLabel] = useState("")
  const [totalNetsuitePkTax, setTotalNetsuitePkTax] = useState("")
  const [eligibleSnuggleProfit, setEligibleSnuggleProfit] = useState("")
  const [shannonTourJobsExcluded, setShannonTourJobsExcluded] = useState("")
  const [rows, setRows] = useState<AccountManagerMonthlyInput[]>([
    createBlankRow(1),
    createBlankRow(2),
    createBlankRow(3),
  ])
  const [nextRowId, setNextRowId] = useState(4)

  const totalNetsuitePkTaxValue = parseCurrencyInput(totalNetsuitePkTax)
  const eligibleSnuggleProfitValue = parseCurrencyInput(eligibleSnuggleProfit)
  const shannonTourJobsExcludedValue = parseCurrencyInput(shannonTourJobsExcluded)

  const breakdown = useMemo(
    () => buildPkTaxBreakdown(totalNetsuitePkTaxValue, eligibleSnuggleProfitValue),
    [eligibleSnuggleProfitValue, totalNetsuitePkTaxValue]
  )

  const totals = useMemo<MetricTotals>(() => {
    return rows.reduce<MetricTotals>(
      (accumulator, row) => {
        accumulator.companyProfit += parseCurrencyInput(row.companyProfit)
        accumulator.snuggleProfit += parseCurrencyInput(row.snuggleProfit)
        accumulator.pkTax += parseCurrencyInput(row.pkTax)
        accumulator.orders += parseOrdersInput(row.orders)
        return accumulator
      },
      { companyProfit: 0, snuggleProfit: 0, pkTax: 0, orders: 0 }
    )
  }, [rows])

  const results = useMemo<AccountManagerResult[]>(() => {
    return rows.map((row) => {
      const companyProfitShare = getShare(parseCurrencyInput(row.companyProfit), totals.companyProfit)
      const snuggleProfitShare = getShare(parseCurrencyInput(row.snuggleProfit), totals.snuggleProfit)
      const pkTaxShare = getShare(parseCurrencyInput(row.pkTax), totals.pkTax)
      const ordersShare = getShare(parseOrdersInput(row.orders), totals.orders)

      const weightedScore =
        companyProfitShare * COMPANY_PROFIT_WEIGHT +
        snuggleProfitShare * SNUGGLE_PROFIT_WEIGHT +
        pkTaxShare * PK_TAX_WEIGHT +
        ordersShare * ORDERS_WEIGHT

      return {
        id: row.id,
        name: row.name.trim() || `Account Manager ${row.id}`,
        companyProfitShare,
        snuggleProfitShare,
        pkTaxShare,
        ordersShare,
        weightedScore,
        payout: breakdown.totalAccountManagerBonusPool * weightedScore,
      }
    })
  }, [breakdown.totalAccountManagerBonusPool, rows, totals])

  const totalWeightedScore = useMemo(
    () => results.reduce((sum, row) => sum + row.weightedScore, 0),
    [results]
  )
  const totalPayout = useMemo(() => results.reduce((sum, row) => sum + row.payout, 0), [results])
  const remainingDifference = breakdown.totalAccountManagerBonusPool - totalPayout

  const hasZeroMetricTotal =
    totals.companyProfit === 0 || totals.snuggleProfit === 0 || totals.pkTax === 0 || totals.orders === 0

  const summary = useMemo<MonthlyPkTaxSummary>(
    () => ({
      monthLabel: monthLabel.trim(),
      totalNetsuitePkTax: totalNetsuitePkTaxValue,
      eligibleSnuggleProfit: eligibleSnuggleProfitValue,
      shannonTourJobsExcluded: shannonTourJobsExcludedValue,
      breakdown,
      totals: {
        companyProfit: totals.companyProfit,
        snuggleProfit: totals.snuggleProfit,
        pkTax: totals.pkTax,
        orders: totals.orders,
        totalWeightedScore,
        totalPayout,
        remainingDifference,
      },
      results,
    }),
    [
      breakdown,
      eligibleSnuggleProfitValue,
      monthLabel,
      remainingDifference,
      results,
      shannonTourJobsExcludedValue,
      totalNetsuitePkTaxValue,
      totalPayout,
      totalWeightedScore,
      totals,
    ]
  )

  function updateRow(
    id: number,
    field: keyof Omit<AccountManagerMonthlyInput, "id">,
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

        if (field === "orders") {
          return { ...row, orders: clampNumberInput(value, true) }
        }

        return { ...row, [field]: clampNumberInput(value) }
      })
    )
  }

  function addRow() {
    setRows((currentRows) => [...currentRows, createBlankRow(nextRowId)])
    setNextRowId((currentId) => currentId + 1)
  }

  function removeRow(id: number) {
    if (rows.length === 1) {
      toast.error("At least one account manager row must remain.")
      return
    }

    setRows((currentRows) => currentRows.filter((row) => row.id !== id))
  }

  function resetCalculator() {
    setMonthLabel("")
    setTotalNetsuitePkTax("")
    setEligibleSnuggleProfit("")
    setShannonTourJobsExcluded("")
    setRows([createBlankRow(1), createBlankRow(2), createBlankRow(3)])
    setNextRowId(4)
    toast.success("PK Tax calculator reset.")
  }

  async function handleCopySummary() {
    const summaryLines = [
      "PK Tax Monthly Summary",
      `Month: ${summary.monthLabel || "Not set"}`,
      "",
      `Total Netsuite PK Tax: ${formatCurrency(summary.totalNetsuitePkTax)}`,
      `Account Manager PK Tax Allocation (40%): ${formatCurrency(summary.breakdown.accountManagerAllocation)}`,
      `EPCC Retained (40%): ${formatCurrency(summary.breakdown.epccRetained)}`,
      `Admin / Bank Fees (10%): ${formatCurrency(summary.breakdown.adminBankFees)}`,
      `Marketing (5%): ${formatCurrency(summary.breakdown.marketing)}`,
      `Operations (5%): ${formatCurrency(summary.breakdown.operations)}`,
      `Eligible Snuggle Profit: ${formatCurrency(summary.eligibleSnuggleProfit)}`,
      `Snuggle Pool Contribution (7%): ${formatCurrency(summary.breakdown.snugglePoolContribution)}`,
      `Total Account Manager Bonus Pool: ${formatCurrency(summary.breakdown.totalAccountManagerBonusPool)}`,
    ]

    if (summary.shannonTourJobsExcluded > 0) {
      summaryLines.push(
        `Shannon Tour Jobs Excluded (info only): ${formatCurrency(summary.shannonTourJobsExcluded)}`
      )
    }

    summaryLines.push(
      "",
      "Account Managers:",
      ...summary.results.map(
        (row) =>
          `- ${row.name}: weighted score ${formatPercent(row.weightedScore)}, payout ${formatCurrency(row.payout)}`
      ),
      "",
      `Total Payout: ${formatCurrency(summary.totals.totalPayout)}`
    )

    if (hasZeroMetricTotal) {
      summaryLines.push(
        "Warning: One or more report totals are zero, so that metric weighting cannot be distributed."
      )
    }

    try {
      await copyToClipboard(summaryLines.join("\n"))
      toast.success("PK Tax summary copied.")
    } catch {
      toast.error("Failed to copy PK Tax summary.")
    }
  }

  return (
    <div className="space-y-6">
      {/* <section className="rounded-2xl border border-zinc-800 bg-[#111219] p-5 shadow-[0_0_25px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">Report Sources</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-medium text-white">Netsuite PK Tax Report</p>
            <p className="mt-2 text-sm text-zinc-400">
              PK Tax per account manager and total Netsuite PK Tax for the month.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-medium text-white">Netsuite Profit Report</p>
            <p className="mt-2 text-sm text-zinc-400">
              Company profit per account manager, excluding PK Tax.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-medium text-white">Snuggle Report</p>
            <p className="mt-2 text-sm text-zinc-400">
              Snuggle profit per account manager, excluding Shannon&apos;s tour jobs.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Pull the Snuggle report from Monday and download as Excel.
            </p>
            <p className="mt-1 text-xs text-zinc-500">Do not include any of Shannon&apos;s tour jobs.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-medium text-white">Netsuite Order Snapshot</p>
            <p className="mt-2 text-sm text-zinc-400">
              Number of orders each account manager processed in the month.
            </p>
          </div>
        </div>
      </section> */}

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-zinc-800 bg-[#111219] p-5 shadow-[0_0_25px_rgba(0,0,0,0.2)]">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              Monthly Pool Inputs
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Manual Pool Setup</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Month Label
              </label>
              <input
                type="text"
                value={monthLabel}
                onChange={(event) => setMonthLabel(event.target.value)}
                placeholder="April 2026"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Total Netsuite PK Tax
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  £
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalNetsuitePkTax}
                  onChange={(event) => setTotalNetsuitePkTax(clampNumberInput(event.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-10 py-3 text-sm text-white outline-none transition focus:border-red-500/40"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Eligible Snuggle Profit
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  £
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={eligibleSnuggleProfit}
                  onChange={(event) => setEligibleSnuggleProfit(clampNumberInput(event.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-10 py-3 text-sm text-white outline-none transition focus:border-red-500/40"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Shannon Tour Jobs Excluded
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                  £
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shannonTourJobsExcluded}
                  onChange={(event) => setShannonTourJobsExcluded(clampNumberInput(event.target.value))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-10 py-3 text-sm text-white outline-none transition focus:border-red-500/40"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">Informational only for this manual-entry version.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-600/5 p-5 shadow-[0_0_25px_rgba(239,68,68,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">Allocation Breakdown</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {formatCurrency(breakdown.totalAccountManagerBonusPool)}
          </p>
          <div className="mt-4 space-y-2 text-sm text-zinc-400">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Account Manager PK Tax Allocation (40%)</span>
              <span className="font-medium text-zinc-200">
                {formatCurrency(breakdown.accountManagerAllocation)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>EPCC Retained (40%)</span>
              <span className="font-medium text-zinc-200">{formatCurrency(breakdown.epccRetained)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Admin / Bank Fees (10%)</span>
              <span className="font-medium text-zinc-200">{formatCurrency(breakdown.adminBankFees)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Marketing (5%)</span>
              <span className="font-medium text-zinc-200">{formatCurrency(breakdown.marketing)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Operations (5%)</span>
              <span className="font-medium text-zinc-200">{formatCurrency(breakdown.operations)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <span>Snuggle Pool Contribution (7%)</span>
              <span className="font-medium text-zinc-200">
                {formatCurrency(breakdown.snugglePoolContribution)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-[#111219] p-5 shadow-[0_0_25px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
              Account Manager Manual Entry
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Monthly Inputs</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              Copy Summary
            </button>
            <button
              type="button"
              onClick={resetCalculator}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={addRow}
              className="rounded-xl border border-red-500/20 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-600/20"
            >
              Add Account Manager
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400 md:grid-cols-2 xl:grid-cols-4">
          <p>{INPUT_GUIDANCE.companyProfit}</p>
          <p>{INPUT_GUIDANCE.snuggleProfit}</p>
          <p>{INPUT_GUIDANCE.pkTax}</p>
          <p>{INPUT_GUIDANCE.orders}</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-zinc-300">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                <th className="pb-3 pr-3">Account Manager Name</th>
                <th className="pb-3 pr-3">Company Profit</th>
                <th className="pb-3 pr-3">Snuggle Profit</th>
                <th className="pb-3 pr-3">PK Tax</th>
                <th className="pb-3 pr-3">Orders</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(event) => updateRow(row.id, "name", event.target.value)}
                      placeholder={`Account Manager ${row.id}`}
                      className="w-full min-w-[190px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/40"
                    />
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.companyProfit}
                      onChange={(event) => updateRow(row.id, "companyProfit", event.target.value)}
                      placeholder="0.00"
                      className="w-full min-w-[145px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/40"
                    />
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.snuggleProfit}
                      onChange={(event) => updateRow(row.id, "snuggleProfit", event.target.value)}
                      placeholder="0.00"
                      className="w-full min-w-[145px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/40"
                    />
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.pkTax}
                      onChange={(event) => updateRow(row.id, "pkTax", event.target.value)}
                      placeholder="0.00"
                      className="w-full min-w-[145px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/40"
                    />
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.orders}
                      onChange={(event) => updateRow(row.id, "orders", event.target.value)}
                      placeholder="0"
                      className="w-full min-w-[110px] rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500/40"
                    />
                  </td>
                  <td className="border-t border-zinc-900 py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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

      {hasZeroMetricTotal ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          One or more report totals are zero, so that metric weighting cannot be distributed.
        </div>
      ) : null}

      <section className="rounded-2xl border border-zinc-800 bg-[#111219] p-5 shadow-[0_0_25px_rgba(0,0,0,0.2)]">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Results Table</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
            Weighted Scores and Bonus Payouts
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-zinc-300">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                <th className="pb-3 pr-3">Name</th>
                <th className="pb-3 pr-3">Company Profit %</th>
                <th className="pb-3 pr-3">Snuggle Profit %</th>
                <th className="pb-3 pr-3">PK Tax %</th>
                <th className="pb-3 pr-3">Orders %</th>
                <th className="pb-3 pr-3">Weighted Score %</th>
                <th className="pb-3">Bonus Payout</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id}>
                  <td className="border-t border-zinc-900 py-3 pr-3 font-medium text-white">{row.name}</td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    {formatPercent(row.companyProfitShare)}
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">
                    {formatPercent(row.snuggleProfitShare)}
                  </td>
                  <td className="border-t border-zinc-900 py-3 pr-3">{formatPercent(row.pkTaxShare)}</td>
                  <td className="border-t border-zinc-900 py-3 pr-3">{formatPercent(row.ordersShare)}</td>
                  <td className="border-t border-zinc-900 py-3 pr-3 font-medium text-red-300">
                    {formatPercent(row.weightedScore)}
                  </td>
                  <td className="border-t border-zinc-900 py-3 font-medium text-zinc-100">
                    {formatCurrency(row.payout)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-[#111219] p-5 shadow-[0_0_25px_rgba(0,0,0,0.2)]">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Totals and Checks</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Company Profit</p>
            <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totals.companyProfit)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Snuggle Profit</p>
            <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totals.snuggleProfit)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total PK Tax</p>
            <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totals.pkTax)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Orders</p>
            <p className="mt-2 text-xl font-semibold text-white">{totals.orders.toFixed(0)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Weighted Score</p>
            <p className="mt-2 text-xl font-semibold text-red-300">{formatPercent(totalWeightedScore)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total Payout</p>
            <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(totalPayout)}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 md:col-span-2 xl:col-span-3">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Remaining / Rounding Difference Against Total Bonus Pool
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(remainingDifference)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
