"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import PkIcon from "@/assets/P&K_ICON.png"
import PkLogo from "@/assets/P&K_LOGO.png"
import ThemeToggle from "@/components/theme/ThemeToggle"

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    label: "Price Calculators",
    href: "/hub/calculators",
    icon: (
      <>
        <rect width="14" height="18" x="5" y="3" rx="2" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01" />
      </>
    ),
  },
  {
    label: "Garment Directory",
    href: "/hub/garments",
    icon: <path d="M20.38 3.46 16 2l-2 3-2-3-4.38 1.46L6 9l3 2v9h6v-9l3-2Z" />,
  },
  {
    label: "PK Tax",
    href: "/hub/pk-tax",
    icon: (
      <>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    label: "Referrals",
    href: "/hub/referrals",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: "Quick Reference",
    href: "/hub/reference",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </>
    ),
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function HubSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hub-dashboard-sidebar w-full rounded-[2rem] p-4 lg:w-[320px] lg:shrink-0">
     <div className="flex justify-center pt-2">
  <Link href="/" aria-label="Pins Hub home">
    <Image
      src={PkLogo}
      alt="Pins & Knuckles"
      priority
      className="h-auto w-[220px]"
    />
  </Link>
</div>
{/*       
<div className="rounded-2xl border border-brand-border bg-brand-panel-alt/70 px-4 py-3">
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-bold text-brand-cream">Theme</span>
    <ThemeToggle compact />
  </div>
</div> */}

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "hub-dashboard-nav-item group flex min-h-14 items-center gap-4 rounded-2xl px-4 text-sm font-bold transition",
                active ? "hub-dashboard-nav-item-active" : "",
              ].join(" ")}
            >
              <svg
                className={[
                  "h-5 w-5 shrink-0 transition",
                  active ? "text-brand-red" : "text-brand-muted group-hover:text-brand-cream",
                ].join(" ")}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-4 border-t border-brand-border pt-5">
        <div className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-panel-alt/70 p-4">
          <Image
            src={PkIcon}
            alt=""
            className="h-12 w-12 rounded-full"
          />
          <div className="min-w-0">
            <p className="font-bold text-brand-cream">Pins Hub</p>
            <p className="text-sm text-brand-muted">v1.0.0</p>
          </div>
          <span className="ml-auto text-brand-muted">⌄</span>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border bg-brand-panel-alt text-sm font-bold text-brand-muted">
          N
        </div>
      </div>
    </aside>
  )
}