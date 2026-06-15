import Image from "next/image"
import HubSidebar from "@/components/HubSidebar"
import NavigationCard from "@/components/NavigationCard"
import PkLogo from "@/assets/P&K_LOGO.png"

export default function Home() {
  return (
    <div className="hub-home-shell text-brand-cream">
      <div className="hub-home-frame">
        <HubSidebar />

        <main className="hub-home-main">
          <div className="flex flex-col gap-6">
            <section className="hub-home-hero">
              <div className="relative z-10">
                <p className="hub-kicker">Pins Hub</p>
                <Image
                  src={PkLogo}
                  alt="Pins & Knuckles Merchandise"
                  priority
                  className="mt-3 h-auto w-[330px] max-w-full"
                />
                <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-muted">
                  Pricing, garment data, finance workflows, referrals, and reusable
                  operational copy in one system.
                </p>
              </div>
            </section>

            <section className="hub-home-grid">
              <NavigationCard
                href="/hub/calculators"
                title="Price Calculators"
                description="Operational quote builders for EU pricing flows and client-ready copy."
                badge="Open Tool"
                icon={
                  <>
                    <rect width="14" height="18" x="5" y="3" rx="2" />
                    <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/garments"
                title="Garment Directory"
                description="Reference catalogue with connected markup visibility and garment management."
                badge="Open Tool"
                icon={
                  <path d="M20.38 3.46 16 2l-2 3-2-3-4.38 1.46L6 9l3 2v9h6v-9l3-2Z" />
                }
              />

              <NavigationCard
                href="/hub/pk-tax"
                title="PK Tax"
                description="Finance dashboard for PK Tax, payout allocation, and shared-pool outputs."
                badge="Open Tool"
                icon={
                  <>
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/referrals"
                title="Refferals"
                description="Referral planning, scenario modelling, and CRM-style team operations."
                badge="Open Tool"
                icon={
                  <>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </>
                }
              />

              <NavigationCard
                href="/hub/reference"
                title="Quick Reference"
                description="Operational copy, delivery and import data, saved messages, and supplier emails."
                badge="Open Tool"
                icon={
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h6" />
                  </>
                }
              />

              <NavigationCard
                title="Order Management"
                description="Reserved for the upcoming order workflow surface."
                badge="Coming Soon"
                disabled
                icon={
                  <>
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </>
                }
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}