"use client"

// 热门彩种卡片负责把彩种热度与下一期开奖时间压缩成首页侧边的快速决策入口。
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { TrendingUp, Flame, Clock, Users, ChevronRight } from "lucide-react"
import type { SpecialLotteryTab } from "@/src/features/home/model/types"
import { toCountdown } from "@/src/shared/utils/date"
import { cn } from "@/lib/utils"

interface TrendingLotteriesProps {
  tabs?: SpecialLotteryTab[]
  activeTabID?: number
  className?: string
}

interface TrendingSlot {
  id: number
  name: string
  period: string
  participants: number
  nextDraw: string
  trend: "hot" | "rising"
  change: string
  placeholder?: boolean
  imageURL?: string
}

const fallbackData: TrendingSlot[] = [
  {
    id: 1,
    name: "澳门六合彩",
    period: "2026-068",
    participants: 12580,
    nextDraw: "2小时后",
    trend: "hot",
    change: "+15%",
  },
  {
    id: 2,
    name: "香港六合彩",
    period: "2026-068",
    participants: 9856,
    nextDraw: "4小时后",
    trend: "rising",
    change: "+8%",
  },
]

export function TrendingLotteries({ tabs, activeTabID, className }: TrendingLotteriesProps) {
  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    // 右侧热门彩种的倒计时需要实时跳动，因此这里单独建立一个 1 秒刷新节奏。
    const timer = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const baseSource: TrendingSlot[] = useMemo(
    () =>
      tabs && tabs.length > 0
        ? tabs.map((item, index) => {
          // next_draw_at 统一在这里转换成倒计时字符串，组件内部不直接计算时间差。
          const countdown = toCountdown(item.next_draw_at)
          const trend: TrendingSlot["trend"] = index % 2 === 0 ? "hot" : "rising"
          return {
            id: item.id,
            name: item.name,
            period: item.current_issue || "----",
            participants: 10000 - index * 777,
            nextDraw: countdown.display,
            trend,
            change: index % 2 === 0 ? "+12%" : "+6%",
          }
          })
        : fallbackData,
    [tabs, tick]
  )

  // 当真实彩种数量不超过两个时，改成上下布局，避免右侧出现空列导致卡片太稀。
  const useVerticalPairLayout = baseSource.length <= 2

  const source: TrendingSlot[] = [...baseSource]
  if (!useVerticalPairLayout) {
    // 大于两条时补足到四宫格，让侧栏结构更稳定；补位卡只负责占位和引导。
    while (source.length < 4) {
      const idx = source.length + 1
      source.push({
        id: -idx,
        name: "更多彩种",
        period: "--",
        participants: 0,
        nextDraw: "敬请期待",
        trend: "rising",
        change: "NEW",
        placeholder: true,
        imageURL: `/placeholder.jpg`
      })
    }
  }

  return (
    <section
      className={cn(
        "relative h-full w-full min-w-0 max-w-full overflow-hidden bg-transparent p-0 lg:flex lg:flex-col lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 hidden h-32 w-32 rounded-full bg-accent/10 blur-3xl lg:block" />

      <div className="relative z-10 mb-5 flex items-center justify-between lg:mb-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 lg:rounded-xl">
            <Flame className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold leading-6 text-foreground lg:text-lg">热门彩种</h2>
          </div>
        </div>
        <Link
          href="/history"
          // 查看全部只做纯跳转，去掉多余的本地请求动作，避免之前那种“反应慢半拍”的体验。
          className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
        >
          查看全部 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div
        className={cn(
          "gap-3 lg:gap-4",
          useVerticalPairLayout
            ? "grid grid-cols-1 lg:flex-1 lg:grid lg:grid-cols-1 lg:grid-rows-2"
            : "grid auto-rows-fr sm:grid-cols-2 lg:flex-1"
        )}
      >
        {source.map((item, index) => (
          <Link
            key={item.id}
            href={item.placeholder ? "/history" : `/history?tabId=${item.id}`}
            // 卡片本身直接承担导航职责，避免包裹 button 再触发额外状态切换。
            className={cn(
              "group relative h-full w-full min-w-0 overflow-hidden rounded-2xl bg-secondary/10 px-4 py-4 text-left transition-all duration-300 hover:bg-secondary/18 lg:flex lg:flex-col lg:justify-center lg:rounded-xl lg:border lg:border-border/50 lg:bg-secondary/30 lg:px-4 lg:py-4 lg:hover:border-primary/50 lg:hover:bg-secondary/50",
              useVerticalPairLayout ? "min-h-0 lg:min-h-[162px]" : "min-h-0 lg:min-h-[154px]",
              activeTabID === item.id && !item.placeholder && "border-primary/60 bg-primary/5",
              item.placeholder && "border-dashed border-border/70 bg-secondary/10 hover:border-border/70"
            )}
          >
            {item.placeholder ? (
              // 占位卡的背景图只做轻提示，不应该抢走真实彩种卡的注意力。
              <img
                src={item.imageURL}
                alt={item.name}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                loading="lazy"
              />
            ) : null}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-1 text-[17px] font-semibold leading-6 text-foreground transition-colors group-hover:text-primary lg:text-base">
                    {item.name}
                  </h3>
                  <p className="line-clamp-1 text-[13px] leading-5 text-muted-foreground lg:text-sm">第 {item.period} 期</p>
                </div>
              </div>
              <div
                className={cn(
                  "mt-0.5 flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  item.trend === "hot"
                    ? "bg-accent/20 text-accent"
                    : "bg-primary/15 text-primary"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {item.change}
              </div>
            </div>

            <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[13px] leading-5 lg:text-sm">
              <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{item.participants > 0 ? `${item.participants.toLocaleString()} 关注` : "推荐位"}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{item.nextDraw}</span>
              </div>
            </div>

            <div className="relative z-10 mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted/70">
              <div
                // 进度条只是热度示意，不直接等于真实比例，因此用视觉上递减的宽度表达层级。
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${85 - index * 15}%`,
                  background:
                    item.trend === "hot"
                      ? "linear-gradient(90deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 68%, white) 100%)"
                      : "linear-gradient(90deg, var(--accent) 0%, color-mix(in oklch, var(--accent) 68%, white) 100%)",
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
