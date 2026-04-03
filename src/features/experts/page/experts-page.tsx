"use client"

// 高手推荐页负责承接高手榜单、筛选条件和关注入口，是高手业务的主页面容器。
import { useEffect, useMemo, useState } from "react"
import { Award, Flame, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { cn } from "@/lib/utils"
import { useExpertsData } from "@/src/features/experts/hooks/use-experts-data"
import type { ExpertItem } from "@/src/features/experts/model/types"
import { ExpertRankCard } from "@/src/shared/ui/expert-rank-card"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { InfoNoteCard } from "@/src/shared/ui/info-note-card"
import { MetricTile } from "@/src/shared/ui/metric-tile"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { PageTitleBar } from "@/src/shared/ui/page-title-bar"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { StatePanel } from "@/src/shared/ui/state-panel"

interface BoardTab {
  key: string
  title: string
  subtitle: string
}

const fallbackBoardTabs: BoardTab[] = [
  { key: "accuracy", title: "准确率榜", subtitle: "稳定命中" },
  { key: "streak", title: "连中榜", subtitle: "持续上分" },
  { key: "hot", title: "人气榜", subtitle: "关注度高" },
  { key: "rookie", title: "新秀榜", subtitle: "成长迅速" }
]

function calcTrendRate(item: ExpertItem): number {
  // trendRate 是页面内的视觉指标，不直接等于后端任意单一字段。
  const base = Math.max(25, Math.min(98, Math.round(item.hit_rate || 0)))
  const streakBoost = Math.max(0, Math.min(12, item.streak * 2))
  return Math.min(99, base + streakBoost)
}

export function ExpertsPage() {
  const { state } = useExpertsData()
  const [activeBoardKey, setActiveBoardKey] = useState("")

  const boardTabs = useMemo<BoardTab[]>(() => {
    if (state.groups.length === 0) {
      // 后端暂无数据时仍然保留兜底 tab，避免榜单切换栏整块消失。
      return fallbackBoardTabs
    }

    return state.groups.map((group, index) => ({
      key: group.key,
      title: group.title,
      subtitle: index === 0 ? "主力榜单" : "实时更新"
    }))
  }, [state.groups])

  useEffect(() => {
    // activeBoardKey 始终与当前 groups 保持同步，避免切换彩种后指向一个失效 tab。
    if (!activeBoardKey && boardTabs.length > 0) {
      setActiveBoardKey(boardTabs[0].key)
      return
    }
    if (activeBoardKey && !boardTabs.some((tab) => tab.key === activeBoardKey)) {
      setActiveBoardKey(boardTabs[0]?.key || "")
    }
  }, [activeBoardKey, boardTabs])

  const activeGroup = useMemo(
    // 当前激活分组找不到时，回退到第一组，保证页面总有内容可展示。
    () => state.groups.find((group) => group.key === activeBoardKey) || state.groups[0],
    [activeBoardKey, state.groups]
  )

  const activeItems = activeGroup?.items || []
  const weeklyStar = activeItems[0]

  const overview = useMemo(() => {
    const allItems = state.groups.flatMap((group) => group.items)
    // 概览指标全部由当前所有榜单聚合而来，不单独请求额外接口。
    const totalExperts = new Set(allItems.map((item) => item.user_id)).size
    const avgHitRate =
      allItems.length > 0
        ? Number((allItems.reduce((sum, item) => sum + (item.hit_rate || 0), 0) / allItems.length).toFixed(1))
        : 0
    const maxStreak = allItems.reduce((max, item) => Math.max(max, item.streak || 0), 0)
    const hotUsers = allItems.reduce((sum, item) => sum + Math.max(0, Math.round((item.return_rate || 0) * 10)), 0)

    return {
      totalExperts,
      avgHitRate,
      maxStreak,
      hotUsers
    }
  }, [state.groups])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <PageSectionShell className="lg:bg-card/85 lg:p-6" padding="page">
          <PageTitleBar title="高手推荐" size="hero" />

          <div className="mb-6 hidden gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="认证高手" value={overview.totalExperts || 0} className="rounded-[22px] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-background/40 lg:shadow-none" valueClassName="text-2xl font-bold text-foreground" />
            <MetricTile label="今日上榜" value={state.total || activeItems.length || 0} className="rounded-[22px] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-background/40 lg:shadow-none" valueClassName="text-2xl font-bold text-foreground" />
            <MetricTile label="平均命中率" value={`${overview.avgHitRate}%`} className="rounded-[22px] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-background/40 lg:shadow-none" valueClassName="text-2xl font-bold text-emerald-400" />
            <MetricTile label="当前最高连中" value={overview.maxStreak} className="rounded-[22px] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-background/40 lg:shadow-none" valueClassName="text-2xl font-bold text-rose-400" />
          </div>

          {state.error ? <ErrorBanner className="mb-4">{state.error}</ErrorBanner> : null}

          <div className="mb-5 rounded-[24px] bg-secondary/12 p-1.5 lg:rounded-xl lg:border lg:border-border/60 lg:bg-secondary/25">
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
              {boardTabs.map((tab) => {
                const active = tab.key === activeBoardKey
                return (
                  <PillToggleButton
                    key={tab.key}
                    // 板块切换只在前端切换 activeGroup，不重复请求后端。
                    onClick={() => setActiveBoardKey(tab.key)}
                    selected={active}
                    tone="panel"
                    shape="soft"
                    className={cn(
                      "relative justify-start border px-3 py-2 text-left transition-all duration-200",
                      active
                        ? "border-primary/45 bg-background text-primary shadow-[0_14px_32px_-20px_rgba(234,179,8,0.55)]"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-background/65 hover:text-foreground"
                    )}
                  >
                    <p className="text-sm font-semibold">{tab.title}</p>
                    {active ? <span className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-primary/90" /> : null}
                  </PillToggleButton>
                )
              })}
            </div>
          </div>

          {state.loading ? (
            <StatePanel className="border border-border/60 bg-background/50 shadow-none">加载中...</StatePanel>
          ) : !weeklyStar ? (
            <StatePanel className="border border-border/60 bg-background/50 shadow-none">暂无榜单数据</StatePanel>
          ) : (
            <>
              <section className="mb-5 rounded-[26px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.2)] lg:rounded-2xl lg:border lg:border-primary/40 lg:via-card/95 lg:to-background/70 lg:shadow-none">
                {/* 本周之星使用当前榜单第一名，形成“主推位 + 列表”层次。 */}
                <div className="mb-4 flex items-center gap-2 text-primary">
                  <Award className="h-4 w-4" />
                  <p className="text-sm font-semibold">本周之星</p>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                  <div className="flex flex-wrap items-center gap-4">
                    <img
                      src={weeklyStar.avatar || "/placeholder-user.jpg"}
                      alt={weeklyStar.nickname || "高手"}
                      className="h-16 w-16 rounded-full border border-primary/30 object-cover"
                      loading="lazy"
                    />

                    <div className="min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-foreground">{weeklyStar.nickname || `用户${weeklyStar.user_id}`}</h2>
                        <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {weeklyStar.user_type || "认证高手"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">{weeklyStar.score_label || "稳定命中，持续输出高质量预测"}</p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-secondary/65 px-2 py-1 text-muted-foreground">{activeGroup?.title || "榜单"}</span>
                        <span className="rounded-full bg-secondary/65 px-2 py-1 text-muted-foreground">{weeklyStar.streak_label || `${weeklyStar.streak} 连中`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center sm:min-w-[340px]">
                    <MetricTile label="命中率" value={`${weeklyStar.hit_rate}%`} className="lg:bg-background/50" valueClassName="text-xl font-bold text-emerald-400" />
                    <MetricTile label="连中" value={weeklyStar.streak} className="lg:bg-background/50" valueClassName="text-xl font-bold text-rose-400" />
                    <MetricTile label="回报率" value={`${weeklyStar.return_rate}%`} className="lg:bg-background/50" valueClassName="text-xl font-bold text-foreground" />
                    <MetricTile label="热度指数" value={overview.hotUsers || 0} className="lg:bg-background/50" valueClassName="text-xl font-bold text-foreground" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {activeItems.map((item) => {
                  const trendRate = calcTrendRate(item)
                  return (
                    <ExpertRankCard
                      key={`${activeGroup?.key || "group"}-${item.user_id}`}
                      item={item}
                      trendRate={trendRate}
                      followCountText={`${Math.max(1, 100 - item.rank * 3)}k`}
                      actions={
                        <>
                          <Button className="h-10 min-w-[92px] gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Users className="h-4 w-4" />
                            关注
                          </Button>
                          <Button variant="outline" className="h-10 min-w-[92px] border-border/70">
                            查看详情
                          </Button>
                        </>
                      }
                    />
                  )
                })}
              </section>

              <div className="mt-5 flex justify-center">
                <Button variant="outline" className="min-w-[280px] border-border/70">
                  查看更多高手
                </Button>
              </div>
            </>
          )}
        </PageSectionShell>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoNoteCard
            title="榜单说明"
            description="榜单每 5 分钟刷新一次，命中率与连中值来自后台统计服务。"
            icon={<Flame className="h-4 w-4" />}
          />
          <InfoNoteCard
            title="风险提示"
            description="榜单仅供参考，请理性参与。异常账户会在后台风控系统中自动降权。"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
