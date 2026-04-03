import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatePanelProps {
  children: ReactNode
  className?: string
  size?: "default" | "tall"
  variant?: "soft" | "outlined" | "dashed"
}

const sizeClassMap = {
  default: "py-12",
  tall: "py-16",
} as const

const variantClassMap = {
  soft: "rounded-[26px] bg-secondary/10 text-center text-sm text-muted-foreground shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:shadow-none",
  outlined: "rounded-[26px] border border-border/60 bg-card/90 text-center text-sm text-muted-foreground shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:bg-card lg:shadow-none",
  dashed: "rounded-xl border border-dashed border-border/60 bg-transparent text-center text-sm text-muted-foreground shadow-none",
} as const

export function StatePanel({ children, className, size = "default", variant = "soft" }: StatePanelProps) {
  return (
    <div
      className={cn(
        variantClassMap[variant],
        sizeClassMap[size],
        className
      )}
    >
      {children}
    </div>
  )
}
