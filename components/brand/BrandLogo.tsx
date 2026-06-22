import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BRAND_NAME } from "@/lib/brand"

interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "footer"
  href?: string
  /** Adds a light backing when placed on dark backgrounds (e.g. footer). */
  onDark?: boolean
}

/** Height + max-width tuned for the wide banner asset (icon + wordmark + tagline). */
const sizes = {
  sm: { height: 28, maxWidth: 100 },
  md: { height: 34, maxWidth: 130 },
  lg: { height: 52, maxWidth: 200 },
  footer: { height: 44, maxWidth: 160 },
}

export default function BrandLogo({ className, size = "md", href, onDark = false }: BrandLogoProps) {
  const s = sizes[size]

  const content = (
    <div
      className={cn(
        "flex shrink-0 items-center",
        onDark && "rounded-lg bg-white px-2 py-1 shadow-sm",
        className,
      )}
    >
      <Image
        src="/banner.png"
        alt={BRAND_NAME}
        width={s.maxWidth * 2}
        height={s.height * 2}
        className="h-auto w-auto object-contain object-left"
        style={{ height: s.height, maxWidth: s.maxWidth }}
        priority={size === "md"}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
