import BackLink from "@/components/BackLink"
import PkTaxCalculatorClient from "./PkTaxCalculatorClient"

export default function PkTaxPage() {
  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Sales Tools</p>
        <h1 className="hub-page-header-title">PK Tax Calculator</h1>
        <p className="hub-page-header-copy">
          Manual-entry monthly calculator for PK Tax and Snuggle pool distribution using the
          confirmed Netsuite and Monday report process.
        </p>
      </section>

      <PkTaxCalculatorClient />
    </div>
  )
}
