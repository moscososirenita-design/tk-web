"use client"

// LiveDraw 负责首页开奖主卡片：彩种切换、倒计时、号码球和快捷操作都在这里集中编排。
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { History, ChevronRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import type { DashboardData, SpecialLotteryTab } from "@/src/features/home/model/types"
import { formatDateTime, toCountdown } from "@/src/shared/utils/date"
import { getLotteryBallFilledClass } from "@/src/shared/utils/lottery-ball"
import { cn } from "@/lib/utils"

const fallbackLotteryTypes = [
  { id: "macau", name: "澳彩", time: "21:30", color: "from-amber-500 to-orange-600" },
  { id: "hongkong", name: "港彩", time: "21:00", color: "from-rose-500 to-pink-600" },
  { id: "taiwan", name: "台彩", time: "20:30", color: "from-emerald-500 to-teal-600" },
]

const fallbackNumbers = [
  { num: "02", zodiac: "牛", element: "木" },
  { num: "11", zodiac: "狗", element: "金" },
  { num: "17", zodiac: "龙", element: "木" },
  { num: "24", zodiac: "猪", element: "火" },
  { num: "32", zodiac: "羊", element: "木" },
  { num: "48", zodiac: "猪", element: "水" },
]
const fallbackBonusNumber = { num: "09", zodiac: "猴", element: "火" }

interface LiveDrawProps {
  tabs?: SpecialLotteryTab[]
  activeTabID?: number
  dashboard?: DashboardData | null
  onTabChange?: (tabID: number) => void
  className?: string
  desktopDensity?: "default" | "compact"
}

function splitLabel(raw: string | undefined): { zodiac: string; element: string } {
  // label 约定格式为“生肖/五行”，拆不开时回退成占位符，避免页面直接显示 undefined。
  const [zodiac, element] = String(raw || "").split("/")
  return {
    zodiac: zodiac || "-",
    element: element || "-"
  }
}

function buildBalls(
  numbers: number[] | undefined,
  labels: string[] | undefined,
  colorLabels?: string[] | undefined
): {
  normals: Array<{ num: string; zodiac: string; element: string; colorLabel?: string }>
  bonus: { num: string; zodiac: string; element: string; colorLabel?: string }
} {
  if (!numbers || numbers.length === 0) {
    // 没有真实开奖号码时回退兜底演示数据，保证首页布局稳定。
    return { normals: fallbackNumbers, bonus: fallbackBonusNumber }
  }

  const withLabels = numbers.map((num, index) => {
    // 号码和生肖/五行标签按索引一一对齐，方便下面统一渲染。
    const parsed = splitLabel(labels?.[index])
    return {
      num: String(num).padStart(2, "0"),
      zodiac: parsed.zodiac,
      element: parsed.element,
      colorLabel: colorLabels?.[index]
    }
  })

  // 最后一位默认视为特别号，其余号码归为普通号。
  const bonus = withLabels[withLabels.length - 1] || fallbackBonusNumber
  return {
    normals: withLabels.slice(0, Math.max(0, withLabels.length - 1)),
    bonus
  }
}

export function LiveDraw({
  tabs,
  activeTabID,
  dashboard,
  onTabChange,
  className,
  desktopDensity = "default",
}: LiveDrawProps) {
  const [activeType, setActiveType] = useState<string>("")
  // 倒计时拆成结构化对象，方便后面单独强调秒位、做更醒目的数字盒子。
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const tabsRailRef = useRef<HTMLDivElement | null>(null)
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState<{
    left: number
    top: number
    width: number
    height: number
    ready: boolean
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false
  })

  const viewTabs = useMemo(
    () =>
      tabs && tabs.length > 0
        ? tabs.map((item, index) => ({
            id: String(item.id),
            name: item.name,
            // tab 上显示的是“下一期开奖时间”的时分秒，而不是当前期开奖时间。
            time: item.next_draw_at ? formatDateTime(item.next_draw_at).split(" ")[1] || "--:--:--" : "--:--:--",
            color: fallbackLotteryTypes[index % fallbackLotteryTypes.length].color
          }))
        : fallbackLotteryTypes,
    [tabs]
  )

  const activeID = activeTabID ? String(activeTabID) : activeType || viewTabs[0]?.id || ""
  const fillRowTabs = viewTabs.length <= 3
  const tabRailLayoutClass =
    viewTabs.length === 1
      ? "grid grid-cols-1 gap-1.5 overflow-hidden"
      : viewTabs.length === 2
        ? "grid grid-cols-2 gap-1.5 overflow-hidden"
        : viewTabs.length === 3
          ? "grid grid-cols-3 gap-1.5 overflow-hidden"
          : "flex gap-1.5 overflow-x-auto"
  const activeTabMeta = viewTabs.find((item) => item.id === activeID) || viewTabs[0] || fallbackLotteryTypes[0]
  const rawNextDrawTime =
    (tabs || []).find((item) => String(item.id) === activeID)?.next_draw_at ||
    dashboard?.special_lottery?.next_draw_at ||
    ""
  const visibleDrawTime = rawNextDrawTime || dashboard?.draw?.draw_at || ""
  const isSwitchingPanel = Boolean(
    activeID && dashboard?.special_lottery?.id && String(dashboard.special_lottery.id) !== activeID
  )

  // 号码球数据统一在进入渲染前整理好，模板层只管展示。
  const balls = buildBalls(dashboard?.draw?.numbers, dashboard?.draw?.labels, dashboard?.draw?.color_labels)
  const activeHistoryHref = activeID ? `/history?tabId=${activeID}` : "/history"
  // “查看详情”需要知道当前彩种和默认期号，方便默认定位到对应的开奖现场。
  const activeSceneHref = activeID
    ? `/draw-scene?tabId=${activeID}&issue=${dashboard?.draw?.issue || dashboard?.special_lottery?.current_issue || ""}`
    : "/draw-scene"
  const isCompactDesktop = desktopDensity === "compact"

  useEffect(() => {
    // 当外部 activeTabID 更新时，同步本地激活态，避免按钮高亮滞后。
    setActiveType(activeID)
  }, [activeID])

  useEffect(() => {
    const updateIndicator = () => {
      const rail = tabsRailRef.current
      const target = tabButtonRefs.current[activeID]
      if (!rail || !target) {
        setTabIndicatorStyle((prev) => ({ ...prev, ready: false }))
        return
      }

      setTabIndicatorStyle({
        left: target.offsetLeft,
        top: target.offsetTop,
        width: target.offsetWidth,
        height: target.offsetHeight,
        ready: true
      })
    }

    const frame = window.requestAnimationFrame(updateIndicator)
    window.addEventListener("resize", updateIndicator)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", updateIndicator)
    }
  }, [activeID, viewTabs])

  useEffect(() => {
    const tick = () => {
      // 倒计时只依赖下一期开奖时间，每秒刷新一次即可。
      const parsed = toCountdown(rawNextDrawTime)
      setCountdown({
        hours: parsed.hours,
        minutes: parsed.minutes,
        seconds: parsed.seconds
      })
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [rawNextDrawTime])

  return (
    <section
      className={cn(
        "relative w-full min-w-0 max-w-full overflow-hidden bg-transparent lg:flex lg:h-full lg:flex-col lg:rounded-2xl lg:border lg:border-border/50 lg:bg-gradient-to-br lg:from-card lg:via-card lg:to-secondary/20",
        className
      )}
    >
      <div className="absolute -right-20 -top-20 hidden h-40 w-40 rounded-full bg-primary/20 blur-3xl lg:block" />
      <div className="absolute -bottom-20 -left-20 hidden h-40 w-40 rounded-full bg-accent/20 blur-3xl lg:block" />

      <div
        ref={tabsRailRef}
        className={cn(
          "relative border-b border-border/40 px-0 pb-0.5 scrollbar-hide md:pb-3 lg:border-border/50",
          tabRailLayoutClass,
          isCompactDesktop ? "lg:px-5 lg:pb-3 lg:pt-4" : "lg:p-4"
        )}
      >
        {tabIndicatorStyle.ready ? (
          <span
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-0 rounded-[16px] bg-gradient-to-r shadow-[0_14px_34px_-18px_rgba(245,158,11,0.72)] transition-[transform,width,height,background-image,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              activeTabMeta.color
            )}
            style={{
              width: `${tabIndicatorStyle.width}px`,
              height: `${tabIndicatorStyle.height}px`,
              transform: `translate3d(${tabIndicatorStyle.left}px, ${tabIndicatorStyle.top}px, 0)`
            }}
          />
        ) : null}
        {viewTabs.map((type) => (
          <button
            key={type.id}
            ref={(node) => {
              tabButtonRefs.current[type.id] = node
            }}
            onClick={() => {
              setActiveType(type.id)
              if (onTabChange) {
                // 只有能转成合法数字 id 的 tab 才触发外部切换请求。
                const tabID = Number(type.id)
                if (Number.isFinite(tabID) && tabID > 0) {
                  onTabChange(tabID)
                }
              }
            }}
            className={cn(
              "relative z-10 flex h-[44px] items-center justify-center overflow-hidden rounded-[16px] border px-3 text-center will-change-transform transition-[transform,box-shadow,color,border-color,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-[84px] md:min-w-[112px] md:h-[52px] md:px-4",
              fillRowTabs ? "min-w-0 w-full" : "shrink-0",
              activeID === type.id
                ? "border-transparent bg-transparent text-slate-900 -translate-y-[1px] scale-[1.01] dark:text-white"
                : "border-border/50 bg-secondary/70 text-foreground/80 hover:-translate-y-[1px] hover:scale-[1.01] hover:border-primary/25 hover:bg-primary/10 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "relative block text-[14px] font-black leading-none md:text-sm",
                "tracking-[0.01em]",
                activeID === type.id ? "text-slate-900 dark:text-white" : "text-foreground"
              )}
            >
              {type.name}
            </span>
            {activeID === type.id && (
              <span className="absolute right-2 top-1.5 flex h-2.5 w-2.5 md:top-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 dark:bg-white/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.24)] dark:bg-white" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        key={`${dashboard?.special_lottery?.id || activeID}-${dashboard?.draw?.issue || 'empty'}-${dashboard?.special_lottery?.next_draw_at || ''}`}
        className={cn(
          "live-draw-panel relative px-0 py-2.5 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid lg:flex-1 lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)_auto]",
          isSwitchingPanel ? "translate-y-1 opacity-80 blur-[1px]" : "translate-y-0 opacity-100 blur-0",
          isCompactDesktop ? "lg:px-5 lg:pb-5 lg:pt-4" : "lg:p-6"
        )}
      >
        <div
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:flex md:items-center md:justify-between md:gap-4",
            isCompactDesktop ? "mb-3 lg:mb-4" : "mb-2.5 md:mb-6"
          )}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Zap className="h-3.5 w-3.5 text-primary md:h-5 md:w-5" />
              <h2 className="text-[15px] font-bold leading-none text-foreground md:text-2xl">
                第 <span className="text-primary">{dashboard?.draw?.issue || dashboard?.special_lottery?.current_issue || "----"}</span> 期
              </h2>
            </div>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground md:text-sm">
              下期开奖: {visibleDrawTime ? formatDateTime(visibleDrawTime) : "-"}
            </p>
            {!dashboard?.draw?.numbers?.length ? (
              <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">当前显示兜底演示数据</p>
            ) : null}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium text-muted-foreground md:text-xs">距下期开奖</p>
            <div className="mt-1 flex items-center justify-end gap-1 font-mono text-sm font-extrabold md:text-xl">
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-primary md:px-2 md:py-1">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-primary">:</span>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-primary md:px-2 md:py-1">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-primary">:</span>
                {/* 秒位继续保留强调色，让用户第一眼就能感知它在实时跳动。 */}
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-accent md:px-2 md:py-1">
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "max-w-full lg:flex lg:min-h-0 lg:items-center lg:justify-center",
            isCompactDesktop ? "mb-3.5 lg:mb-0" : "mb-3.5"
          )}
        >
          <div className="overflow-hidden pb-0.5 md:flex md:justify-center lg:w-full">
            <div className="flex w-full min-w-0 items-start justify-between gap-0 px-0 md:mx-auto md:w-fit md:min-w-0 md:justify-center md:gap-4 md:px-0">
              {balls.normals.map((ball, index) => (
                <div key={index} className="flex min-w-0 flex-1 basis-0 flex-col items-center md:min-w-[64px] md:flex-none md:gap-2">
                  <div
                    className={cn(
                      // 号码球颜色优先跟后端配置/号码规则对齐，不再按索引轮换。
                      "flex aspect-square w-full max-w-[48px] items-center justify-center rounded-full border bg-gradient-to-br text-white shadow-xl transition-all duration-500 md:h-[68px] md:w-[68px] md:max-w-none lg:h-[82px] lg:w-[82px]",
                      isCompactDesktop && "lg:h-[76px] lg:w-[76px]",
                      getLotteryBallFilledClass(Number(ball.num), ball.colorLabel)
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span
                      className={cn(
                        "font-mono text-[18px] font-black leading-none text-white md:text-[28px]",
                        isCompactDesktop ? "lg:text-[30px]" : "lg:text-[34px]"
                      )}
                    >
                      {ball.num}
                    </span>
                  </div>
                  <span className="mt-2 w-full text-center text-[11px] font-black leading-[1.15] tracking-[0.01em] text-muted-foreground md:mt-2.5 md:text-[15px] lg:text-base">
                    {ball.zodiac}/{ball.element}
                  </span>
                </div>
              ))}

              <div className="flex shrink-0 min-w-[7px] items-center justify-center pt-1 text-[14px] font-medium text-muted-foreground md:min-w-[32px] md:pt-5 md:text-[34px]">
                +
              </div>

              <div className="flex min-w-0 flex-1 basis-0 flex-col items-center md:min-w-[64px] md:flex-none md:gap-2">
                <div
                  className={cn(
                    "flex aspect-square w-full max-w-[48px] items-center justify-center rounded-full border bg-gradient-to-br text-white shadow-xl transition-all duration-500 md:h-[68px] md:w-[68px] md:max-w-none lg:h-[82px] lg:w-[82px]",
                    isCompactDesktop && "lg:h-[76px] lg:w-[76px]",
                    getLotteryBallFilledClass(Number(balls.bonus.num), balls.bonus.colorLabel)
                  )}
                  style={{ animationDelay: "700ms" }}
                >
                    <span
                      className={cn(
                        "font-mono text-[18px] font-black leading-none text-white md:text-[28px]",
                        isCompactDesktop ? "lg:text-[30px]" : "lg:text-[34px]"
                      )}
                    >
                    {balls.bonus.num}
                  </span>
                </div>
                <span className="mt-2 w-full text-center text-[11px] font-black leading-[1.15] tracking-[0.01em] text-muted-foreground md:mt-2.5 md:text-[15px] lg:text-base">
                  {balls.bonus.zodiac}/{balls.bonus.element}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-start gap-2 md:mt-auto md:justify-center md:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-[38px] rounded-full border-0 bg-slate-100/94 px-4 text-[12px] font-black text-slate-700 shadow-none hover:bg-slate-200/94 lg:h-8 lg:rounded-md lg:border lg:bg-secondary/70 lg:px-3 lg:text-sm lg:text-foreground/85"
            asChild
          >
            <Link href={activeHistoryHref}>
              <History className="h-4 w-4" />
              历史记录
            </Link>
          </Button>
          <Button
            size="sm"
            className="h-[38px] rounded-full bg-primary/12 px-4 text-[12px] font-black text-primary shadow-none hover:bg-primary/18 lg:h-8 lg:rounded-md lg:bg-primary lg:px-3 lg:text-sm lg:text-primary-foreground"
            asChild
          >
            <Link href={activeSceneHref}>
              查看详情
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <style jsx>{`
        @keyframes liveDrawPanelIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.992);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .live-draw-panel {
          animation: liveDrawPanelIn 560ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </section>
  )
}
