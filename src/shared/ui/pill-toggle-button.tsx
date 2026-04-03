import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

type PillToggleTone = "primary" | "amber" | "panel"
type PillToggleSize = "xs" | "sm" | "md"
type PillToggleShape = "pill" | "capsule" | "soft"

interface PillToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  tone?: PillToggleTone
  size?: PillToggleSize
  shape?: PillToggleShape
  shrink?: boolean
  children: ReactNode
}

const toneClassMap: Record<PillToggleTone, { selected: string; idle: string }> = {
  // primary 负责大多数“后台筛选 / 分类切换”胶囊按钮。
  primary: {
    selected: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
    idle: "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary",
  },
  // amber 负责开奖类页面更强调的彩种切换。
  amber: {
    selected:
      "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-[0_14px_34px_-18px_rgba(245,158,11,0.72)]",
    idle: "border-border/50 bg-secondary/75 text-muted-foreground hover:border-primary/20 hover:bg-primary/10 hover:text-primary",
  },
  // panel 负责消息/榜单这种放在淡色面板里的二级切换。
  panel: {
    selected: "bg-background text-foreground shadow-[0_12px_30px_-18px_rgba(0,0,0,0.95)]",
    idle: "text-muted-foreground hover:text-foreground",
  },
}

const sizeClassMap: Record<PillToggleSize, string> = {
  xs: "px-3 py-1 text-xs font-medium",
  sm: "px-4 py-2 text-sm font-medium",
  md: "px-4 py-2 text-[13px] font-black",
}

const shapeClassMap: Record<PillToggleShape, string> = {
  pill: "rounded-full",
  capsule: "rounded-[18px] border",
  soft: "rounded-lg",
}

export function PillToggleButton({
  selected = false,
  tone = "primary",
  size = "sm",
  shape = "pill",
  shrink = false,
  className,
  children,
  type = "button",
  ...props
}: PillToggleButtonProps) {
  const toneClass = selected ? toneClassMap[tone].selected : toneClassMap[tone].idle

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-300",
        sizeClassMap[size],
        shapeClassMap[shape],
        shrink && "shrink-0",
        toneClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
