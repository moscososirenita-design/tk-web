import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricTileProps {
  label: string
  value: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
}

export function MetricTile({ label, value, className, labelClassName, valueClassName }: MetricTileProps) {
  return (
    <div className={cn("rounded-2xl bg-secondary/10 p-3 text-center lg:rounded-lg", className)}>
      <div className={cn("text-xl font-bold text-foreground", valueClassName)}>{value}</div>
      <div className={cn("mt-1 text-xs text-muted-foreground", labelClassName)}>{label}</div>
    </div>
  )
}
