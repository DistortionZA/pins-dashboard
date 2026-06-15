import { connection } from "next/server"

import BackLink from "@/components/BackLink"
import ReferralsClient from "./ReferralsClient"
import { getReferralsData } from "./data"

export default async function ReferralsPage() {
  await connection()
  const data = await getReferralsData()

  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Sales Tools</p>
        <h1 className="hub-page-header-title">Referrals</h1>
        <p className="hub-page-header-copy">
          Prototype referral reward structures, test scenarios, compare saved models, and export
          planning outputs before any real referral system is implemented.
        </p>
      </section>

      <ReferralsClient initialData={data} />
    </div>
  )
}
