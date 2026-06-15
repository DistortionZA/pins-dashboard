"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import AccordionSection from "./AccordionSection"
import {
  deleteReferralScenario,
  duplicateReferralScenario,
  saveReferralScenario,
} from "./actions"
import type { ReferralsHubData } from "./data"
import ReferralRuleCard from "./ReferralRuleCard"
import ReferralScenarioManager from "./ReferralScenarioManager"
import ReferralSimulationSummary from "./ReferralSimulationSummary"
import ReferralTabs from "./ReferralTabs"
import ReferralTestCaseCard from "./ReferralTestCaseCard"
import {
  applyReferralCodeTemplate,
  buildPlanningSummary,
  buildReferralCodePreview,
  buildScenarioExportPayload,
  createBlankRule,
  createBlankTestCase,
  createDefaultRules,
  createDefaultTestCases,
  simulateReferralRules,
  type ReferralCodeStyle,
  type ReferralRuleCardData,
  type ReferralTestCaseData,
  type SimulatorTab,
} from "./simulator"
import { useRouter } from "next/navigation"

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

function makeLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function cloneRule(rule: ReferralRuleCardData): ReferralRuleCardData {
  return {
    ...rule,
    id: makeLocalId("rule"),
    name: `${rule.name} Copy`,
  }
}

function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function sanitizeFileName(value: string) {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) {
    return "referral-rule-simulator"
  }

  return trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "referral-rule-simulator"
}

export default function ReferralsClient({ initialData }: { initialData: ReferralsHubData }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SimulatorTab>("simulator")
  const [rules, setRules] = useState<ReferralRuleCardData[]>(() => createDefaultRules())
  const [testCases, setTestCases] = useState<ReferralTestCaseData[]>(() => createDefaultTestCases())
  const [previewName, setPreviewName] = useState("Acme Atelier")
  const [previewCustomCode, setPreviewCustomCode] = useState("")
  const [previewCodeStyle, setPreviewCodeStyle] = useState<ReferralCodeStyle>("name-based")
  const [previewRewardLabel, setPreviewRewardLabel] = useState("10% off")
  const [previewMessageTemplate, setPreviewMessageTemplate] = useState(
    "Use my referral code [code] at Pins&Knuckles: [code]",
  )
  const [scenarioName, setScenarioName] = useState("Tier A v1")
  const [scenarioNotes, setScenarioNotes] = useState(
    "Planning-only prototype scenario. Shared team scenarios are for design review only and do not update real referrals.",
  )
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)

  const [isScenarioPending, startScenarioTransition] = useTransition()

  const simulatorAggregate = useMemo(() => simulateReferralRules(rules, testCases), [rules, testCases])
  const activeRulesCount = useMemo(() => rules.filter((rule) => rule.enabled).length, [rules])

  const referrerOptions = useMemo(() => {
    return testCases.map((testCase) => ({
      value: `test:${testCase.id}`,
      label: `${testCase.name} · Test Case`,
    }))
  }, [testCases])

  const savedScenarios: ReferralsHubData["scenarios"] = initialData.scenarios

  const referralCodePreview = useMemo(
    () =>
      buildReferralCodePreview({
        name: previewName,
        customCode: previewCustomCode,
        codeStyle: previewCodeStyle,
        rewardLabel: previewRewardLabel,
      }),
    [previewCodeStyle, previewCustomCode, previewName, previewRewardLabel],
  )

  const referralLinkPreview = useMemo(
    () => `https://pinsknuckles.com/ref/${referralCodePreview}`,
    [referralCodePreview],
  )

  const referralMessagePreview = useMemo(
    () => applyReferralCodeTemplate(previewMessageTemplate, referralCodePreview),
    [previewMessageTemplate, referralCodePreview],
  )

  function updateRule(nextRule: ReferralRuleCardData) {
    setRules((currentRules) =>
      currentRules.map((rule) => (rule.id === nextRule.id ? nextRule : rule)),
    )
  }

  function addRule() {
    setRules((currentRules) => [
      ...currentRules,
      {
        ...createBlankRule(),
        id: makeLocalId("rule"),
        name: `Rule ${currentRules.length + 1}`,
      },
    ])
    toast.success("Rule card added to the simulator.")
  }

  function duplicateRule(ruleId: string) {
    setRules((currentRules) => {
      const sourceRule = currentRules.find((rule) => rule.id === ruleId)
      if (!sourceRule) {
        return currentRules
      }

      return [...currentRules, cloneRule(sourceRule)]
    })
    toast.success("Rule card duplicated.")
  }

  function deleteRule(ruleId: string) {
    setRules((currentRules) => currentRules.filter((rule) => rule.id !== ruleId))
    toast.success("Rule card removed.")
  }

  function updateTestCase(nextTestCase: ReferralTestCaseData) {
    setTestCases((currentCases) =>
      currentCases.map((testCase) => (testCase.id === nextTestCase.id ? nextTestCase : testCase)),
    )
  }

  function addTestCase() {
    setTestCases((currentCases) => [
      ...currentCases,
      {
        ...createBlankTestCase(),
        id: makeLocalId("case"),
        name: `Test Case ${currentCases.length + 1}`,
      },
    ])
    toast.success("Test case added.")
  }

  function deleteTestCase(testCaseId: string) {
    setTestCases((currentCases) => currentCases.filter((testCase) => testCase.id !== testCaseId))
    toast.success("Test case removed.")
  }

  function buildCurrentExportPayload() {
    return buildScenarioExportPayload({
      scenarioName,
      scenarioNotes,
      rules,
      testCases,
      aggregate: simulatorAggregate,
    })
  }

  async function handleCopyPlanningSummary() {
    const summary = buildPlanningSummary(rules, testCases, simulatorAggregate)

    try {
      await copyToClipboard(summary)
      toast.success("Planning summary copied.")
    } catch {
      toast.error("Failed to copy planning summary.")
    }
  }

  function handleExportJson() {
    try {
      const payload = buildCurrentExportPayload()
      downloadJsonFile(
        `${sanitizeFileName(scenarioName)}-referral-rule-simulator.json`,
        JSON.stringify(payload, null, 2),
      )
      toast.success("Scenario JSON exported.")
    } catch {
      toast.error("Failed to export scenario JSON.")
    }
  }

  async function handleCopyScenarioComparison(summary: string) {
    try {
      await copyToClipboard(summary)
      toast.success("Scenario comparison summary copied.")
    } catch {
      toast.error("Failed to copy scenario comparison summary.")
    }
  }

  async function handleCopyPreviewValue(value: string, successMessage: string) {
    try {
      await copyToClipboard(value)
      toast.success(successMessage)
    } catch {
      toast.error("Failed to copy preview value.")
    }
  }

  function saveScenario() {
    const formData = new FormData()
    if (activeScenarioId) {
      formData.set("scenarioId", activeScenarioId)
    }
    formData.set("name", scenarioName)
    formData.set("notes", scenarioNotes)
    formData.set("rulesJson", JSON.stringify(rules))
    formData.set("testCasesJson", JSON.stringify(testCases))
    formData.set("summaryJson", JSON.stringify(simulatorAggregate))

    startScenarioTransition(() => {
      void saveReferralScenario(formData).then((result) => {
        if (!result.ok) {
          toast.error(result.message)
          return
        }

        if (result.scenarioId) {
          setActiveScenarioId(result.scenarioId)
        }
        toast.success(result.message)
        router.refresh()
      })
    })
  }

  function loadScenario(scenarioId: string) {
    const scenario = savedScenarios.find((entry) => entry.id === scenarioId)
    if (!scenario) {
      toast.error("Saved scenario not found.")
      return
    }

    setRules(scenario.rules)
    setTestCases(scenario.testCases)
    setScenarioName(scenario.name)
    setScenarioNotes(scenario.notes)
    setActiveScenarioId(scenario.id)
    setActiveTab("comparison")
    toast.success(`Loaded ${scenario.name}.`)
  }

  function duplicateScenario(scenarioId: string) {
    const formData = new FormData()
    formData.set("scenarioId", scenarioId)

    startScenarioTransition(() => {
      void duplicateReferralScenario(formData).then((result) => {
        if (!result.ok) {
          toast.error(result.message)
          return
        }

        toast.success(result.message)
        router.refresh()
      })
    })
  }

  function deleteScenario(scenarioId: string) {
    const formData = new FormData()
    formData.set("scenarioId", scenarioId)

    startScenarioTransition(() => {
      void deleteReferralScenario(formData).then((result) => {
        if (!result.ok) {
          toast.error(result.message)
          return
        }

        if (activeScenarioId === scenarioId) {
          setActiveScenarioId(null)
        }
        toast.success(result.message)
        router.refresh()
      })
    })
  }

  function renderSimulatorTab() {
    return (
      <div className="space-y-4">
        <div className="hub-accent-panel rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cream">Prototype Only</p>
          <p className="mt-2 text-sm text-brand-cream">
            Planning tool only — this does not update real customers, referrals, or loyalty points.
          </p>
        </div>

        {initialData.setupIssue ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-brand-cream">
            {initialData.setupIssue}
          </div>
        ) : null}

        <AccordionSection
          title="Referral Code Preview"
          badge="Preview Only"
          summary="Generate example codes, links, and customer-facing copy without reserving anything."
          defaultOpen
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
                  Customer / Brand Name
                </label>
                <input
                  type="text"
                  value={previewName}
                  onChange={(event) => setPreviewName(event.target.value)}
                  className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
                  Custom Code
                </label>
                <input
                  type="text"
                  value={previewCustomCode}
                  onChange={(event) => setPreviewCustomCode(event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2 text-sm uppercase text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
                  Code Style
                </label>
                <select
                  value={previewCodeStyle}
                  onChange={(event) => setPreviewCodeStyle(event.target.value as ReferralCodeStyle)}
                  className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
                >
                  <option value="name-based">name-based</option>
                  <option value="initials-based">initials-based</option>
                  <option value="random">random</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
                    Reward Label
                  </label>
                  <input
                    type="text"
                    value={previewRewardLabel}
                    onChange={(event) => setPreviewRewardLabel(event.target.value)}
                    placeholder="10% off, 100 points, £50 credit"
                    className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-brand-muted/80">
                    Customer-Facing Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={previewMessageTemplate}
                    onChange={(event) => setPreviewMessageTemplate(event.target.value)}
                    className="w-full rounded-lg border border-brand-border bg-brand-panel-alt px-3 py-2 text-sm text-brand-cream focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/30"
                  />
                  <p className="mt-2 text-xs text-brand-muted/80">
                    Use <span className="font-mono text-brand-cream/90">[code]</span> anywhere in the template to insert the preview referral code.
                  </p>
                  <p className="mt-1 text-xs text-brand-muted/80">
                    Preview only — copied codes are not reserved until the real referral system is implemented.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Referral Code</p>
                  <p className="mt-2 font-mono text-sm font-semibold text-brand-cream">{referralCodePreview}</p>
                  <button
                    type="button"
                    onClick={() => void handleCopyPreviewValue(referralCodePreview, "Preview code copied.")}
                    className="mt-3 rounded-lg border border-brand-red/35 bg-brand-red/16 px-2.5 py-1.5 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
                  >
                    Copy Code
                  </button>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3 md:col-span-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Referral Link Using [code]</p>
                  <p className="mt-2 break-all font-mono text-sm text-brand-cream">{referralLinkPreview}</p>
                  <button
                    type="button"
                    onClick={() => void handleCopyPreviewValue(referralLinkPreview, "Preview link copied.")}
                    className="mt-3 rounded-lg border border-brand-red/35 bg-brand-red/16 px-2.5 py-1.5 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Customer-Facing Message Preview</p>
                  <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm text-brand-cream">
                    {referralMessagePreview}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyPreviewValue(referralMessagePreview, "Preview message copied.")}
                  className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-xs font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
                >
                  Copy Full Message
                </button>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Rule Simulator"
          badge={`${activeRulesCount} Active Rules`}
          summary="Build and tune proposed referral reward rules."
          // defaultOpen
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addRule}
                className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
              >
                Add Rule Card
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
                No rule cards yet. Add one to start simulating referral structures.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <ReferralRuleCard
                    key={rule.id}
                    rule={rule}
                    onChange={updateRule}
                    onDuplicate={duplicateRule}
                    onDelete={deleteRule}
                  />
                ))}
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Saved Team Scenarios"
          badge={`${savedScenarios.length} Saved Scenarios`}
          summary="Database-backed planning scenarios shared across the team."
        >
          <ReferralScenarioManager
            activeScenarioId={activeScenarioId}
            scenarioName={scenarioName}
            scenarioNotes={scenarioNotes}
            savedScenarios={savedScenarios}
            onScenarioNameChange={setScenarioName}
            onScenarioNotesChange={setScenarioNotes}
            onSave={saveScenario}
            onLoad={loadScenario}
            onDuplicate={duplicateScenario}
            onDelete={deleteScenario}
          />
          {isScenarioPending ? <p className="mt-3 text-xs text-brand-muted/80">Updating shared scenarios…</p> : null}
        </AccordionSection>

        <AccordionSection
          title="Export Tools"
          badge="Planning Output"
          summary="Share prototype outputs without connecting to a real referral system."
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleCopyPlanningSummary()}
              className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
            >
              Copy Planning Summary
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="rounded-lg border border-brand-border/80 bg-brand-panel-alt px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/40 hover:bg-brand-surface"
            >
              Export JSON
            </button>
          </div>
        </AccordionSection>
      </div>
    )
  }

  function renderTestCasesTab() {
    return (
      <div className="space-y-4">
        <div className="hub-accent-panel rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cream">Planning Tool Only</p>
          <p className="mt-2 text-sm text-brand-cream">
            These cases are projections for rule testing. They do not create or update real customers, referrals, or loyalty points.
          </p>
        </div>

        <AccordionSection
          title="Test Cases"
          badge={`${testCases.length} Cases`}
          summary="Projected scenarios to test how proposed rules behave."
          defaultOpen
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addTestCase}
                className="rounded-lg border border-brand-red/35 bg-brand-red/16 px-3 py-2 text-sm font-semibold text-brand-cream transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
              >
                Add Test Case
              </button>
            </div>

            {testCases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-panel-alt p-4 text-sm text-brand-muted/80">
                No test cases yet. Add one to project tier and reward outcomes.
              </div>
            ) : (
              <div className="space-y-3">
                {testCases.map((testCase) => (
                  <ReferralTestCaseCard
                    key={testCase.id}
                    testCase={testCase}
                    result={simulatorAggregate.results[testCase.id]}
                    referrerOptions={referrerOptions.filter(
                      (option) => option.value !== `test:${testCase.id}`,
                    )}
                    onChange={updateTestCase}
                    onDelete={deleteTestCase}
                  />
                ))}
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Settings"
          badge={`${activeRulesCount} Active Rules`}
          summary="Quick planning context for the current prototype."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Scenario</p>
              <p className="mt-1 font-semibold text-brand-cream">{scenarioName}</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Shared Scenarios</p>
              <p className="mt-1 font-semibold text-brand-cream">{savedScenarios.length}</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-brand-panel-alt p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-muted/80">Mode</p>
              <p className="mt-1 text-sm text-brand-cream/90">Planning and prototype only.</p>
            </div>
          </div>
        </AccordionSection>
      </div>
    )
  }

  function renderComparisonTab() {
    return (
      <div className="space-y-4">
        <div className="hub-accent-panel rounded-2xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cream">Planning Tool Only</p>
          <p className="mt-2 text-sm text-brand-cream">
            Saved team scenarios are shared planning snapshots only. They do not update real customers, referrals, or loyalty points.
          </p>
        </div>

        <ReferralSimulationSummary
          rules={rules}
          testCases={testCases}
          aggregate={simulatorAggregate}
          savedScenarios={savedScenarios}
          onCopyPlanningSummary={handleCopyPlanningSummary}
          onExportJson={handleExportJson}
          onCopyScenarioComparison={(summary) => void handleCopyScenarioComparison(summary)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ReferralTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="rounded-[1.75rem] border border-brand-border bg-brand-panel p-2 shadow-[0_0_25px_rgba(0,0,0,0.28)]">
        <div className="min-h-[960px] overflow-hidden rounded-[1.35rem] bg-brand-panel xl:h-[calc(100vh-13rem)]">
          <div className="h-full overflow-y-auto p-4">
            {activeTab === "simulator" ? renderSimulatorTab() : null}
            {activeTab === "test-cases" ? renderTestCasesTab() : null}
            {activeTab === "comparison" ? renderComparisonTab() : null}
          </div>
        </div>
      </div>
    </div>
  )
}
