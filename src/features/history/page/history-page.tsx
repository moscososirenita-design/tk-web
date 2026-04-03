"use client"

// 开奖历史页负责整合历史开奖列表、彩种筛选与刷新动作。
import { useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarClock, Zap } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { useHistoryData } from "@/src/features/history/hooks/use-history-data"
import { buildHistoryDisplayItems } from "@/src/features/history/model/history-view-model"
import { formatDateTime } from "@/src/shared/utils/date"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { LotteryBallRow } from "@/src/shared/ui/lottery-ball-row"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { PageTitleBar } from "@/src/shared/ui/page-title-bar"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { PillToggleRail } from "@/src/shared/ui/pill-toggle-rail"
import { StatePanel } from "@/src/shared/ui/state-panel"

export function HistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preferredTabID = useMemo(() => {
    // 历史页允许从首页右侧热门彩种直接带 tabId 跳进来并默认选中对应彩种。
    const raw = Number(searchParams.get("tabId") || 0)
    return Number.isFinite(raw) && raw > 0 ? raw : 0
  }, [searchParams])
  const { state, displayItems, selectTab, toggleOrder, toggleShowFive } = useHistoryData(preferredTabID)
  const orderLabel = state.orderMode === "desc" ? "降序" : "升序"
  const historyCards = useMemo(
    // 进入渲染前就把标签、号码球和跳转地址统一整理好，页面层只消费展示对象。
    () => buildHistoryDisplayItems(displayItems, state.showFive, state.activeTabID),
    [displayItems, state.activeTabID, state.showFive]
  )

  const handleSelectTab = (tabID: number) => {
    // 切换彩种时同步 URL，方便分享和返回时直接恢复同一彩种。
    void selectTab(tabID)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tabId", String(tabID))
    router.replace(`/history?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <PageTitleBar title="开奖历史" />

        <PageSectionShell className="mb-4 lg:p-4" padding="page">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PillToggleRail mode="adaptive">
              {state.tabs.map((tab) => (
                <PillToggleButton
                  key={tab.id}
                  // tabs 负责决定“看哪个彩种的历史”；排序和五行只负责“怎么展示”。
                  selected={state.activeTabID === tab.id}
                  tone="amber"
                  shape="capsule"
                  size="md"
                  shrink
                  onClick={() => handleSelectTab(tab.id)}
                >
                  {tab.name}
                </PillToggleButton>
              ))}
            </PillToggleRail>

            <div className="ml-auto flex items-center gap-2">
              {/* “切换”两个字去掉之后，按钮本身直接展示当前排序状态，信息密度更高。 */}
              <Button
                variant="outline"
                size="sm"
                className="h-[32px] rounded-full border-0 bg-secondary/70 px-3 text-[11px] font-black text-foreground/85 shadow-none hover:bg-secondary"
                onClick={toggleOrder}
              >
                {orderLabel}
              </Button>
              <Button
                variant={state.showFive ? "default" : "outline"}
                size="sm"
                className={
                  state.showFive
                    ? "h-[32px] rounded-full bg-primary/12 px-3 text-[11px] font-black text-primary shadow-none hover:bg-primary/18"
                    : "h-[32px] rounded-full border-0 bg-secondary/70 px-3 text-[11px] font-black text-foreground/85 shadow-none hover:bg-secondary"
                }
                onClick={toggleShowFive}
              >
                五行
              </Button>
            </div>
          </div>
        </PageSectionShell>

        {state.error ? <ErrorBanner className="mb-4">{state.error}</ErrorBanner> : null}

        {state.loading ? (
          <StatePanel>
            加载中...
          </StatePanel>
        ) : historyCards.length === 0 ? (
          <StatePanel>
            暂无开奖记录
          </StatePanel>
        ) : (
          <section className="space-y-4">
            {historyCards.map((item) => (
              <Link
                href={item.sceneHref}
                className="group block overflow-hidden rounded-[26px] bg-gradient-to-b from-secondary/20 via-secondary/10 to-transparent p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all hover:bg-secondary/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:shadow-none lg:hover:border-primary/40"
                key={item.id}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <div className="text-[16px] font-bold leading-none md:text-lg">
                        第 <span className="text-primary">{item.issue}</span> 期
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-secondary/78 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {formatDateTime(item.draw_at)}
                  </span>
                </div>

                <div className="rounded-[20px] pb-0.5 transition-colors group-hover:bg-primary/5">
                  <LotteryBallRow balls={item.balls} interactive />
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
