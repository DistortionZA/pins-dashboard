import Link from "next/link"
import type { ReactNode } from "react"

type BackLinkProps = {
  href: string
  children: ReactNode
}

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="hub-back-link">
      <svg
        className="h-4 w-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>{children}</span>
    </Link>
  )
}
