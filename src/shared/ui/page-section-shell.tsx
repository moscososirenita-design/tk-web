import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageSectionTone = "default" | "hero"
type PageSectionPadding = "none" | "compact" | "content" | "page"

interface PageSectionShellOwnProps {
  as?: ElementType
  tone?: PageSectionTone
  padding?: PageSectionPadding
  className?: string
  children: ReactNode
}

type PageSectionShellProps<C extends ElementType> = PageSectionShellOwnProps &
  Omit<ComponentPropsWithoutRef<C>, keyof PageSectionShellOwnProps>

const toneClassMap: Record<PageSectionTone, string> = {
  // 默认壳体负责覆盖站内大多数“移动端渐变 + 桌面端卡片”的内容分区。
  default:
    "rounded-[28px] bg-gradient-to-b from-secondary/18 via-secondary/8 to-transparent shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)] lg:rounded-2xl lg:border lg:border-border/60 lg:bg-card lg:shadow-none",
  // hero 壳体用于详情页首屏这类更强视觉权重的区块。
  hero:
    "overflow-hidden rounded-[30px] bg-gradient-to-b from-secondary/22 via-secondary/10 to-transparent shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)] lg:rounded-2xl lg:border lg:border-border/60 lg:bg-card lg:shadow-none",
}

const paddingClassMap: Record<PageSectionPadding, string> = {
  none: "",
  compact: "px-4 py-4",
  content: "p-5",
  // page 用在筛选区、页头信息区这类需要兼顾移动端和桌面端边距的区域。
  page: "px-4 py-5 md:px-5 md:py-6 lg:p-5",
}

export function PageSectionShell<C extends ElementType = "section">({
  as,
  tone = "default",
  padding = "content",
  className,
  children,
  ...restProps
}: PageSectionShellProps<C>) {
  const Component = (as || "section") as ElementType

  return (
    <Component className={cn(toneClassMap[tone], paddingClassMap[padding], className)} {...restProps}>
      {children}
    </Component>
  )
}
