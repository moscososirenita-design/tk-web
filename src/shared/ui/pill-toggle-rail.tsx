import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PillToggleRailMode = "scroll" | "wrap" | "adaptive"

interface PillToggleRailProps {
  children: ReactNode
  className?: string
  mode?: PillToggleRailMode
}

const modeClassMap: Record<PillToggleRailMode, string> = {
  scroll: "flex gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide",
  wrap: "flex flex-wrap gap-2",
  adaptive: "flex gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide lg:flex-wrap",
}

export function PillToggleRail({ children, className, mode = "scroll" }: PillToggleRailProps) {
  return <div className={cn(modeClassMap[mode], className)}>{children}</div>
}
