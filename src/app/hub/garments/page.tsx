import { connection } from "next/server"

import BackLink from "@/components/BackLink"
import GarmentDirectoryClient from "./GarmentDirectoryClient"
import { getGarmentDirectoryData } from "./data"

export default async function GarmentDirectoryPage() {
  await connection()
  const garments = await getGarmentDirectoryData()

  return (
    <div className="hub-page-stack">
      <BackLink href="/">Back to Hub</BackLink>

      <section className="hub-panel hub-page-header">
        <p className="hub-kicker">Directory</p>
        <h1 className="hub-page-header-title">Garment Directory</h1>
      </section>

      <GarmentDirectoryClient initialGarments={garments} />
    </div>
  )
}
