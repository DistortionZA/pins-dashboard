export const RULE_TYPE_OPTIONS = [
  {
    value: "SPEND_TIER",
    label: "Spend Tier",
    description: "Qualifies when projected spend reaches the threshold inside the planning window.",
  },
  {
    value: "FIRST_ORDER",
    label: "First Order",
    description: "Applies to referred customers with at least one projected order.",
  },
  {
    value: "REPEAT_ORDER",
    label: "Repeat Order",
    description: "Applies when projected orders reach two or more.",
  },
  {
    value: "MANUAL_BONUS",
    label: "Manual Bonus",
    description: "Applies only to test cases marked as manual bonus candidates.",
  },
  {
    value: "LOYALTY_MULTIPLIER",
    label: "Loyalty Multiplier",
    description: "Multiplies the reward value by projected order count for referred customers.",
  },
] as const

export const REWARD_TYPE_OPTIONS = [
  { value: "POINTS", label: "Points" },
  { value: "CASH_VALUE", label: "Cash Value" },
  { value: "DISCOUNT_PERCENT", label: "Discount %" },
  { value: "CREDIT", label: "Credit" },
] as const

export const CURRENCY_OPTIONS = ["$", "EUR", "GBP", "R"] as const

export const TAB_OPTIONS = [
  { value: "simulator", label: "Rule Simulator" },
  { value: "test-cases", label: "Test Cases" },
  { value: "comparison", label: "Scenario Comparison" },
] as const

export const SIMULATOR_STORAGE_KEY = "pins-hub-referral-rule-scenarios"

export type SimulatorTab = (typeof TAB_OPTIONS)[number]["value"]
export type ReferralRuleType = (typeof RULE_TYPE_OPTIONS)[number]["value"]
export type RewardType = (typeof REWARD_TYPE_OPTIONS)[number]["value"]
export type CurrencySymbol = (typeof CURRENCY_OPTIONS)[number]

export type ReferralRuleCardData = {
  id: string
  name: string
  ruleType: ReferralRuleType
  timeWindowMonths: number
  spendThreshold: number
  currency: CurrencySymbol
  rewardType: RewardType
  rewardValue: number
  notes: string
  enabled: boolean
}

export type ReferralTestCaseData = {
  id: string
  name: string
  spendAmount: number
  orderCount: number
  referred: boolean
  referrerKey: string
  manualBonusEligible: boolean
  notes: string
}

export type AppliedRuleResult = {
  ruleId: string
  ruleName: string
  ruleType: ReferralRuleType
  rewardType: RewardType
  rewardValue: number
  rewardDisplay: string
  explanation: string
}

export type TestCaseSimulationResult = {
  testCaseId: string
  tierName: string | null
  appliedRules: AppliedRuleResult[]
  pointsTotal: number
  cashValueTotal: number
  creditTotal: number
  discountPercentTotal: number
}

export type RuleQualificationSummary = {
  ruleId: string
  ruleName: string
  ruleType: ReferralRuleType
  qualifyingCases: number
}

export type SimulatorAggregate = {
  results: Record<string, TestCaseSimulationResult>
  totalPoints: number
  totalCashValue: number
  totalCreditValue: number
  totalDiscountPercent: number
  qualifiedTierCounts: Array<{ ruleId: string; ruleName: string; count: number }>
  ruleSummaries: RuleQualificationSummary[]
}

export type ReferralScenarioData = {
  id: string
  name: string
  notes: string
  rules: ReferralRuleCardData[]
  testCases: ReferralTestCaseData[]
  aggregate: SimulatorAggregate
  createdAt: string
  updatedAt: string
}

export type ReferralScenarioExport = {
  version: 1
  exportedAt: string
  planningOnly: true
  scenario: {
    name: string
    notes: string
  }
  rules: ReferralRuleCardData[]
  testCases: ReferralTestCaseData[]
  outcomes: Array<{
    testCaseId: string
    testCaseName: string
    tierName: string | null
    totals: {
      points: number
      cashValue: number
      creditValue: number
      discountPercent: number
    }
    appliedRules: AppliedRuleResult[]
  }>
  summary: {
    activeRuleCount: number
    testCaseCount: number
    totalSimulatedPoints: number
    totalSimulatedCashValue: number
    totalSimulatedCreditValue: number
    totalSimulatedDiscountPercent: number
    tierQualificationCounts: Array<{ ruleId: string; ruleName: string; count: number }>
    ruleQualificationCounts: RuleQualificationSummary[]
  }
}

export type ReferralCodeStyle = "name-based" | "initials-based" | "random"

export function formatSimulatorMoney(value: number, currency: CurrencySymbol) {
  const safeValue = Number.isFinite(value) ? value : 0
  const formatted = safeValue.toLocaleString("en-US", {
    minimumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })

  if (currency === "EUR") {
    return `EUR ${formatted}`
  }

  if (currency === "GBP") {
    return `GBP ${formatted}`
  }

  return `${currency}${formatted}`
}

export function getRuleTypeLabel(ruleType: ReferralRuleType) {
  return RULE_TYPE_OPTIONS.find((option) => option.value === ruleType)?.label ?? ruleType
}

export function getRewardTypeLabel(rewardType: RewardType) {
  return REWARD_TYPE_OPTIONS.find((option) => option.value === rewardType)?.label ?? rewardType
}

export function getRuleTypeDescription(ruleType: ReferralRuleType) {
  return (
    RULE_TYPE_OPTIONS.find((option) => option.value === ruleType)?.description ??
    "Planning rule."
  )
}

export function createDefaultRules(): ReferralRuleCardData[] {
  return [
    {
      id: "rule-tier-a",
      name: "Tier A: Spend over $250k in 6 months",
      ruleType: "SPEND_TIER",
      timeWindowMonths: 6,
      spendThreshold: 250_000,
      currency: "$",
      rewardType: "POINTS",
      rewardValue: 1_500,
      notes: "Use this to test a premium tier threshold for strong spenders.",
      enabled: true,
    },
    {
      id: "rule-first-order",
      name: "First successful referral order bonus",
      ruleType: "FIRST_ORDER",
      timeWindowMonths: 6,
      spendThreshold: 0,
      currency: "$",
      rewardType: "POINTS",
      rewardValue: 500,
      notes: "Applies when a referred customer is projected to place their first order.",
      enabled: true,
    },
    {
      id: "rule-repeat-order",
      name: "Repeat order loyalty bonus",
      ruleType: "REPEAT_ORDER",
      timeWindowMonths: 6,
      spendThreshold: 0,
      currency: "$",
      rewardType: "CREDIT",
      rewardValue: 1_000,
      notes: "Use this to test extra value once the relationship repeats.",
      enabled: true,
    },
  ]
}

export function createDefaultTestCases(): ReferralTestCaseData[] {
  return [
    {
      id: "case-boreal",
      name: "Boreal Supply",
      spendAmount: 275_000,
      orderCount: 2,
      referred: true,
      referrerKey: "",
      manualBonusEligible: false,
      notes: "Strong launch customer with a second order already in the plan.",
    },
    {
      id: "case-signal",
      name: "Signal House",
      spendAmount: 95_000,
      orderCount: 1,
      referred: true,
      referrerKey: "",
      manualBonusEligible: true,
      notes: "Useful for testing referral-first growth with an optional manual uplift.",
    },
  ]
}

export function createBlankRule(): ReferralRuleCardData {
  return {
    id: "",
    name: "New planning rule",
    ruleType: "SPEND_TIER",
    timeWindowMonths: 6,
    spendThreshold: 0,
    currency: "$",
    rewardType: "POINTS",
    rewardValue: 0,
    notes: "",
    enabled: true,
  }
}

export function createBlankTestCase(): ReferralTestCaseData {
  return {
    id: "",
    name: "New test case",
    spendAmount: 0,
    orderCount: 1,
    referred: false,
    referrerKey: "",
    manualBonusEligible: false,
    notes: "",
  }
}

function clampNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0
  }

  return value
}

function getRewardAmount(rule: ReferralRuleCardData, testCase: ReferralTestCaseData) {
  if (rule.ruleType === "LOYALTY_MULTIPLIER" && rule.rewardType !== "DISCOUNT_PERCENT") {
    return rule.rewardValue * Math.max(testCase.orderCount, 1)
  }

  return rule.rewardValue
}

function buildExplanation(rule: ReferralRuleCardData, testCase: ReferralTestCaseData) {
  const windowText = `${rule.timeWindowMonths} month${rule.timeWindowMonths === 1 ? "" : "s"}`
  const spendText = formatSimulatorMoney(testCase.spendAmount, rule.currency)
  const thresholdText = formatSimulatorMoney(rule.spendThreshold, rule.currency)

  switch (rule.ruleType) {
    case "SPEND_TIER":
      return `${spendText} clears the ${thresholdText} threshold in the ${windowText} plan.`
    case "FIRST_ORDER":
      return `Projected referral order count is ${testCase.orderCount} in the ${windowText} plan.`
    case "REPEAT_ORDER":
      return `Projected orders reach ${testCase.orderCount}, so repeat-order logic is met.`
    case "MANUAL_BONUS":
      return "This case is flagged as a manual bonus candidate for planning."
    case "LOYALTY_MULTIPLIER":
      return `Reward is multiplied across ${Math.max(testCase.orderCount, 1)} projected order(s).`
    default:
      return "Planning rule applied."
  }
}

function qualifiesForRule(rule: ReferralRuleCardData, testCase: ReferralTestCaseData) {
  const spendGate = testCase.spendAmount >= rule.spendThreshold

  switch (rule.ruleType) {
    case "SPEND_TIER":
      return spendGate
    case "FIRST_ORDER":
      return testCase.referred && testCase.orderCount >= 1 && spendGate
    case "REPEAT_ORDER":
      return testCase.orderCount >= 2 && spendGate
    case "MANUAL_BONUS":
      return testCase.manualBonusEligible && spendGate
    case "LOYALTY_MULTIPLIER":
      return testCase.referred && testCase.orderCount >= 1 && spendGate
    default:
      return false
  }
}

export function simulateReferralRules(
  rules: ReferralRuleCardData[],
  testCases: ReferralTestCaseData[],
): SimulatorAggregate {
  const activeRules = rules.filter((rule) => rule.enabled)
  const results: Record<string, TestCaseSimulationResult> = {}
  const tierCounts = new Map<string, { ruleId: string; ruleName: string; count: number }>()
  const ruleSummaries = new Map<string, RuleQualificationSummary>()
  let totalPoints = 0
  let totalCashValue = 0
  let totalCreditValue = 0
  let totalDiscountPercent = 0

  for (const rule of activeRules) {
    ruleSummaries.set(rule.id, {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.ruleType,
      qualifyingCases: 0,
    })

    if (rule.ruleType === "SPEND_TIER") {
      tierCounts.set(rule.id, {
        ruleId: rule.id,
        ruleName: rule.name,
        count: 0,
      })
    }
  }

  for (const testCase of testCases) {
    const appliedRules: AppliedRuleResult[] = []
    let pointsTotal = 0
    let cashValueTotal = 0
    let creditTotal = 0
    let discountPercentTotal = 0

    for (const rule of activeRules) {
      if (!qualifiesForRule(rule, testCase)) {
        continue
      }

      const rewardAmount = clampNumber(getRewardAmount(rule, testCase))
      const summary = ruleSummaries.get(rule.id)

      if (summary) {
        summary.qualifyingCases += 1
      }

      if (rule.ruleType === "SPEND_TIER") {
        const tier = tierCounts.get(rule.id)
        if (tier) {
          tier.count += 1
        }
      }

      if (rule.rewardType === "POINTS") {
        pointsTotal += rewardAmount
      } else if (rule.rewardType === "CASH_VALUE") {
        cashValueTotal += rewardAmount
      } else if (rule.rewardType === "CREDIT") {
        creditTotal += rewardAmount
      } else if (rule.rewardType === "DISCOUNT_PERCENT") {
        discountPercentTotal += rewardAmount
      }

      appliedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.ruleType,
        rewardType: rule.rewardType,
        rewardValue: rewardAmount,
        rewardDisplay:
          rule.rewardType === "DISCOUNT_PERCENT"
            ? `${rewardAmount}%`
            : rule.rewardType === "POINTS"
              ? `${rewardAmount.toLocaleString("en-US")} pts`
              : formatSimulatorMoney(rewardAmount, rule.currency),
        explanation: buildExplanation(rule, testCase),
      })
    }

    const highestTier = appliedRules
      .filter((rule) => rule.ruleType === "SPEND_TIER")
      .sort((left, right) => right.rewardValue - left.rewardValue)[0]

    results[testCase.id] = {
      testCaseId: testCase.id,
      tierName: highestTier?.ruleName ?? null,
      appliedRules,
      pointsTotal,
      cashValueTotal,
      creditTotal,
      discountPercentTotal,
    }

    totalPoints += pointsTotal
    totalCashValue += cashValueTotal
    totalCreditValue += creditTotal
    totalDiscountPercent += discountPercentTotal
  }

  return {
    results,
    totalPoints,
    totalCashValue,
    totalCreditValue,
    totalDiscountPercent,
    qualifiedTierCounts: Array.from(tierCounts.values()),
    ruleSummaries: Array.from(ruleSummaries.values()),
  }
}

export function buildPlanningSummary(
  rules: ReferralRuleCardData[],
  testCases: ReferralTestCaseData[],
  aggregate: SimulatorAggregate,
) {
  const activeRules = rules.filter((rule) => rule.enabled)
  const lines: string[] = [
    "Referral Rule Simulator - Planning Summary",
    "",
    `Active rules: ${activeRules.length}`,
    `Test cases: ${testCases.length}`,
    `Total simulated points: ${aggregate.totalPoints.toLocaleString("en-US")}`,
    `Total simulated cash value: ${formatSimulatorMoney(aggregate.totalCashValue, "$")}`,
    `Total simulated credit value: ${formatSimulatorMoney(aggregate.totalCreditValue, "$")}`,
    "",
    "Rule qualifiers:",
  ]

  if (aggregate.ruleSummaries.length === 0) {
    lines.push("- No active rules.")
  } else {
    for (const summary of aggregate.ruleSummaries) {
      lines.push(`- ${summary.ruleName}: ${summary.qualifyingCases} qualifying test case(s)`)
    }
  }

  lines.push("", "Test case outcomes:")

  if (testCases.length === 0) {
    lines.push("- No test cases.")
  } else {
    for (const testCase of testCases) {
      const result = aggregate.results[testCase.id]
      const appliedRules = result.appliedRules.map((rule) => rule.ruleName).join(", ") || "None"

      lines.push(
        `- ${testCase.name}: ${appliedRules}. Points ${result.pointsTotal.toLocaleString(
          "en-US",
        )}, Cash ${formatSimulatorMoney(result.cashValueTotal, "$")}, Credit ${formatSimulatorMoney(
          result.creditTotal,
          "$",
        )}.`,
      )
    }
  }

  return lines.join("\n")
}

export function buildScenarioExportPayload(input: {
  scenarioName: string
  scenarioNotes: string
  rules: ReferralRuleCardData[]
  testCases: ReferralTestCaseData[]
  aggregate: SimulatorAggregate
}): ReferralScenarioExport {
  const activeRuleCount = input.rules.filter((rule) => rule.enabled).length

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    planningOnly: true,
    scenario: {
      name: input.scenarioName.trim() || "Untitled Scenario",
      notes: input.scenarioNotes.trim(),
    },
    rules: input.rules,
    testCases: input.testCases,
    outcomes: input.testCases.map((testCase) => {
      const result = input.aggregate.results[testCase.id]

      return {
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        tierName: result?.tierName ?? null,
        totals: {
          points: result?.pointsTotal ?? 0,
          cashValue: result?.cashValueTotal ?? 0,
          creditValue: result?.creditTotal ?? 0,
          discountPercent: result?.discountPercentTotal ?? 0,
        },
        appliedRules: result?.appliedRules ?? [],
      }
    }),
    summary: {
      activeRuleCount,
      testCaseCount: input.testCases.length,
      totalSimulatedPoints: input.aggregate.totalPoints,
      totalSimulatedCashValue: input.aggregate.totalCashValue,
      totalSimulatedCreditValue: input.aggregate.totalCreditValue,
      totalSimulatedDiscountPercent: input.aggregate.totalDiscountPercent,
      tierQualificationCounts: input.aggregate.qualifiedTierCounts,
      ruleQualificationCounts: input.aggregate.ruleSummaries,
    },
  }
}

export function buildScenarioComparisonSummary(scenarios: ReferralScenarioData[]) {
  const lines: string[] = ["Referral Rule Simulator - Scenario Comparison", ""]

  if (scenarios.length === 0) {
    lines.push("No saved scenarios.")
    return lines.join("\n")
  }

  for (const scenario of scenarios) {
    const activeRules = scenario.rules.filter((rule) => rule.enabled).length
    lines.push(`${scenario.name}`)
    lines.push(`- Active rules: ${activeRules}`)
    lines.push(`- Total simulated points: ${scenario.aggregate.totalPoints.toLocaleString("en-US")}`)
    lines.push(
      `- Total simulated cash/credit value: ${formatSimulatorMoney(
        scenario.aggregate.totalCashValue + scenario.aggregate.totalCreditValue,
        "$",
      )}`,
    )

    if (scenario.aggregate.qualifiedTierCounts.length === 0) {
      lines.push("- Tier qualifiers: none")
    } else {
      for (const tier of scenario.aggregate.qualifiedTierCounts) {
        lines.push(`- ${tier.ruleName}: ${tier.count} qualifying customer(s)`)
      }
    }

    if (scenario.notes.trim()) {
      lines.push(`- Notes: ${scenario.notes.trim()}`)
    }

    lines.push("")
  }

  return lines.join("\n").trim()
}

export function buildReferralCodePreview(input: {
  name: string
  customCode: string
  codeStyle: ReferralCodeStyle
  rewardLabel: string
}) {
  const normalizedCustomCode = input.customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (normalizedCustomCode) {
    return normalizedCustomCode
  }

  const safeName = input.name.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, "")
  const words = safeName.split(/\s+/).filter(Boolean)

  if (input.codeStyle === "initials-based") {
    const initials = words.map((word) => word[0]).join("").slice(0, 3) || "PK"
    const suffix = `${input.name.length}`.padStart(3, "0").slice(0, 3)
    return `${initials}${suffix}`
  }

  if (input.codeStyle === "random") {
    const seed = `${input.name}${input.rewardLabel || ""}`.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const chars = (seed || "PKX7F2").padEnd(6, "PKX7F2")
    return chars.slice(0, 6)
  }

  const joined = words.join("") || "ACME"
  const prefix = joined.slice(0, 4).padEnd(4, "X")
  const suffix = input.rewardLabel.match(/\d+/)?.[0] ?? "10"
  return `${prefix}${suffix}`.slice(0, 10)
}

export function applyReferralCodeTemplate(template: string, code: string) {
  return template.replaceAll("[code]", code)
}
