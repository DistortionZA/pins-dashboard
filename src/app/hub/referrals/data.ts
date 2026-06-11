import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/db"
import type { ReferralScenarioData } from "./simulator"

const REFERRALS_TAG = "referrals"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseScenarioRow(row: {
  id: string
  name: string
  notes: string
  rulesJson: Prisma.JsonValue
  testCasesJson: Prisma.JsonValue
  summaryJson: Prisma.JsonValue
  createdAt: Date
  updatedAt: Date
}): ReferralScenarioData {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    rules: Array.isArray(row.rulesJson) ? (row.rulesJson as ReferralScenarioData["rules"]) : [],
    testCases: Array.isArray(row.testCasesJson)
      ? (row.testCasesJson as ReferralScenarioData["testCases"])
      : [],
    aggregate: isRecord(row.summaryJson)
      ? (row.summaryJson as ReferralScenarioData["aggregate"])
      : {
          results: {},
          totalPoints: 0,
          totalCashValue: 0,
          totalCreditValue: 0,
          totalDiscountPercent: 0,
          qualifiedTierCounts: [],
          ruleSummaries: [],
        },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function hasReferralScenarioDelegate() {
  const client = prisma as typeof prisma & {
    referralScenario?: {
      findMany?: (...args: unknown[]) => unknown
    }
  }

  return typeof client.referralScenario?.findMany === "function"
}

async function loadReferralsData() {
  if (!hasReferralScenarioDelegate()) {
    return {
      scenarios: [] as ReferralScenarioData[],
      setupIssue:
        "The running Prisma client does not include ReferralScenario yet. Regenerate Prisma client and apply the migration before using the shared planning scenarios.",
    }
  }

  try {
    const scenarios = await prisma.referralScenario.findMany({
      orderBy: { updatedAt: "desc" },
    })

    return {
      scenarios: scenarios.map(parseScenarioRow),
      setupIssue: null as string | null,
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2021" || error.code === "P2022")
    ) {
      return {
        scenarios: [] as ReferralScenarioData[],
        setupIssue:
          "ReferralScenario is not available in the database yet. Apply the Prisma migration before using shared team scenarios.",
      }
    }

    throw error
  }
}

export const getReferralsData = unstable_cache(loadReferralsData, ["referrals-data"], {
  tags: [REFERRALS_TAG],
})

export function getReferralsTag() {
  return REFERRALS_TAG
}

export type ReferralsHubData = Awaited<ReturnType<typeof loadReferralsData>>
