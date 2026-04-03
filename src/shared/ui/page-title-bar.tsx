import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageTitleBarProps {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
  size?: "section" | "hero"
}

const sizeClassMap = {
  section: {
    wrapper: "mb-4 flex flex-wrap items-center justify-between gap-3",
    title: "text-2xl font-bold md:text-3xl",
  },
  hero: {
    wrapper: "mb-6 flex flex-wrap items-start justify-between gap-3",
    title: "text-3xl font-bold tracking-tight md:text-4xl",
  },
} as const

export function PageTitleBar({
  title,
  subtitle,
  actions,
  className,
  titleClassName,
  size = "section",
}: PageTitleBarProps) {
  const preset = sizeClassMap[size]

  return (
    <div className={cn(preset.wrapper, className)}>
      <div className="min-w-0">
        <h1 className={cn(preset.title, titleClassName)}>{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">{actions}</div> : null}
    </div>
  )
}
