import Link from "next/link"
import { connection } from "next/server"
import { prisma } from "@/lib/db"

export default async function ReferralLandingPage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  await connection()
  const { code } = await params
  const referralCode = code.toUpperCase()
  const customer = await prisma.customer.findUnique({
    where: { referralCode },
    select: {
      name: true,
      referralCode: true
    }
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[5%] h-[35rem] w-[35rem] rounded-full bg-brand-red/16 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[25rem] w-[25rem] rounded-full bg-brand-cream/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-[28px] border border-brand-border bg-brand-panel/95 p-8 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-red">Referral Link</p>
        {customer ? (
          <>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-brand-cream">
              Referral code confirmed
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              This link belongs to <span className="font-semibold text-brand-cream">{customer.name}</span>.
              Use code <span className="font-mono text-brand-cream">{customer.referralCode}</span> when
              creating the referred customer in the hub.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-brand-cream">
              Referral code not found
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              The code <span className="font-mono text-brand-cream">{referralCode}</span> does not match
              an existing customer record.
            </p>
          </>
        )}

        <div className="mt-8 rounded-2xl border border-brand-border bg-brand-panel-alt p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted/80">Next Step</p>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">
            QR generation can be added later against this route without changing the referral data
            model or customer links.
          </p>
        </div>

        <Link
          href="/hub/referrals"
          className="mt-8 inline-flex items-center rounded-xl border border-brand-red/35 bg-brand-red/16 px-4 py-2.5 text-sm font-semibold text-brand-red/90 transition-colors hover:border-brand-red/50 hover:bg-brand-red/24"
        >
          Go to Referrals Hub
        </Link>
      </div>
    </div>
  )
}
