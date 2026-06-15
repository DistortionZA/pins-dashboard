import Image from "next/image"

import logoFull from "@/assets/P&K_LOGO.png"
import logoIcon from "@/assets/P&K_ICON.png"

type BrandLogoProps = {
  compact?: boolean
  className?: string
}

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src={logoIcon}
        alt="Pins & Knuckles"
        className={`h-10 w-10 rounded-2xl object-contain ${className}`}
        priority
      />
    )
  }

  return (
    <Image
      src={logoFull}
      alt="Pins & Knuckles"
      className={`h-10 w-auto object-contain ${className}`}
      priority
    />
  )
}
