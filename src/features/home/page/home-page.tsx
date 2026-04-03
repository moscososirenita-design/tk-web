"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Banner } from "@/src/features/home/components/banner"
import { LiveDraw } from "@/src/features/home/components/live-draw"
import { LiveStream } from "@/src/features/home/components/live-stream"
import { QuickTools } from "@/src/features/home/components/quick-tools"
import { StatsBanner } from "@/src/features/home/components/stats-banner"
import { TrendingLotteries } from "@/src/features/home/components/trending-lotteries"
import { WinningStreaks } from "@/src/features/home/components/winning-streaks"
import { Button } from "@/components/ui/actions/button"
import { useHomeData } from "@/src/features/home/hooks/use-home-data"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { LiveChat } from "@/src/shared/layout/live-chat"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { LotteryMediaCard } from "@/src/shared/ui/lottery-media-card"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { PillToggleRail } from "@/src/shared/ui/pill-toggle-rail"
import { StatePanel } from "@/src/shared/ui/state-panel"
import { getCurrentDrawCycleSeconds } from "@/src/shared/utils/date"
import { useIsMobile } from "@/components/ui/hooks/use-mobile"
import { cn } from "@/lib/utils"

const LIVE_COUNTDOWN_WINDOW_SECONDS = 5 * 60
const LIVE_PLAYBACK_KEEP_SECONDS = 30 * 60
const mobileSectionShell = "relative py-1"

function shouldShowLiveStage(nextDrawAt: string | undefined, showPlayer: boolean | undefined, streamURL?: string): boolean {
  // 后端的 live.status / show_player 当前并不可靠，因此前端再叠一层“直播时间窗口”判断。
  if (!showPlayer || !streamURL || !nextDrawAt) {
    return false
  }

  const cycleSeconds = getCurrentDrawCycleSeconds(nextDrawAt)
  if (!Number.isFinite(cycleSeconds)) {
    return false
  }

  // 规则：
  // 1) 开奖前 5 分钟显示预告窗；
  // 2) 开奖后保留 30 分钟播放窗口，避免 next_draw_at 滚到明天后播放器瞬间消失。
  return (
    (cycleSeconds > 0 && cycleSeconds <= LIVE_COUNTDOWN_WINDOW_SECONDS) ||
    (cycleSeconds <= 0 && cycleSeconds >= -LIVE_PLAYBACK_KEEP_SECONDS)
  )
}

export function HomePage() {
  // 首页数据通过一个聚合 hook 统一管理，页面组件只负责编排布局与透传事件。
  const { state, activeTab, reload, selectCategory, selectTab } = useHomeData()
  const [clockTick, setClockTick] = useState(() => Date.now())
  const isMobile = useIsMobile()

  useEffect(() => {
    // 首页需要感知“是否进入直播时间窗口”，因此这里每秒更新一次时钟节奏。
    const timer = setInterval(() => setClockTick(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 直播未开始时，不直接留空，而是把开奖主卡顶上来占据首屏左侧主位。
  const showLivePanel = (() => {
    // 引用 clockTick 的目的不是直接显示当前时间，而是强制首页按秒重算直播显示窗口。
    void clockTick
    const isDashboardAligned = state.dashboard?.special_lottery?.id === state.activeTabID
    return state.loading
      ? false
      : isDashboardAligned && shouldShowLiveStage(
          state.dashboard?.special_lottery?.next_draw_at,
          state.dashboard?.live?.show_player,
          state.dashboard?.live?.stream_url
        )
  })()

  // 右侧榜单条数以“和左侧卡片底部贴齐”为最高优先级：
  // 1. H5 固定只显示前三，避免榜单把移动端首屏拖得过长；
  // 2. Web 端如果左侧存在“快捷工具 + 数据统计”两块，就固定显示 5 条；
  // 3. 如果只剩快捷工具一块，就固定显示 3 条。
  // 直播区是否显示不再放大榜单数量，避免出现右侧高度明显超出左侧的情况。
  const winningLimit = isMobile ? 3 : state.showStatsBanner ? 5 : 3

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        {/* 广播栏优先滚动后台公告，没有数据时才显示默认提示语。 */}
        <section className="mb-5 overflow-hidden rounded-[22px] bg-gradient-to-r from-primary/8 via-secondary/12 to-accent/8 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:rounded-xl lg:border lg:border-primary/20 lg:bg-gradient-to-r lg:from-primary/10 lg:via-card lg:to-accent/10 lg:p-3">
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
              公告
            </span>
            <div className="overflow-hidden flex-1">
              <p className="animate-marquee whitespace-nowrap text-sm text-muted-foreground">
                {(state.broadcasts || [])
                  .map((item) => item.content || item.title)
                  .filter(Boolean)
                  .join(" · ") || "欢迎来到 TK Web，实时开奖与分析服务已接入后端 API。"}
              </p>
            </div>
          </div>
        </section>

        {state.error ? (
          // 首页主请求异常统一在顶部展示，避免某个子模块静默失败导致用户不知所措。
          <ErrorBanner
            className="mb-4"
            action={
              <Button size="sm" variant="outline" onClick={() => void reload()}>
                重试
              </Button>
            }
          >
            {state.error}
          </ErrorBanner>
        ) : null}

        <Banner items={state.banners} loading={state.loading} />

        <div className="space-y-6 lg:hidden">
          {showLivePanel ? (
            <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-primary/10 via-secondary/10 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]`}>
              <LiveStream dashboard={state.dashboard} activeTabName={activeTab?.name} />
            </section>
          ) : null}

          <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-secondary/34 via-secondary/10 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)]`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
                <div>
                  <h2 className="text-[18px] font-bold leading-6 text-foreground">开奖信息</h2>
                </div>
              </div>
            <LiveDraw
              tabs={state.tabs}
              activeTabID={state.activeTabID}
              dashboard={state.dashboard}
              onTabChange={selectTab}
            />
          </section>

          <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-accent/8 via-secondary/8 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)]`}>
            <TrendingLotteries tabs={state.tabs} activeTabID={state.activeTabID} />
          </section>

          <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-secondary/26 via-secondary/8 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)]`}>
            <QuickTools />
          </section>

          {state.showStatsBanner ? (
            <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-primary/8 via-secondary/10 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)]`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div>
                  <h2 className="text-[18px] font-bold leading-6 text-foreground">平台数据</h2>
                </div>
              </div>
              <StatsBanner />
            </section>
          ) : null}

          <section className={`${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-secondary/20 via-secondary/8 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)]`}>
            <WinningStreaks experts={state.experts} limit={winningLimit} />
          </section>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:space-y-6">
          {showLivePanel ? (
            // 直播开始后，视频区单独占一整行，让视频更醒目，同时不打乱下方“开奖区 + 推荐区”的原有结构。
            <div className="grid items-stretch lg:grid-cols-1">
              <LiveStream
                dashboard={state.dashboard}
                activeTabName={activeTab?.name}
                className="h-full"
                fillHeight
              />
            </div>
          ) : null}

          <div className="grid items-stretch lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] lg:gap-6">
            <LiveDraw
              tabs={state.tabs}
              activeTabID={state.activeTabID}
              dashboard={state.dashboard}
              onTabChange={selectTab}
              className="h-full"
              desktopDensity="compact"
            />
            <TrendingLotteries tabs={state.tabs} activeTabID={state.activeTabID} className="h-full" />
          </div>

          <div
            className={cn(
              "grid items-start lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] lg:gap-6",
              state.showStatsBanner ? "lg:grid-rows-[auto_auto]" : "lg:grid-rows-1"
            )}
          >
            <QuickTools className="lg:row-start-1" />
            {state.showStatsBanner ? <StatsBanner className="lg:row-start-2" /> : null}
            <WinningStreaks
              experts={state.experts}
              limit={winningLimit}
              className={cn("lg:col-start-2", state.showStatsBanner ? "lg:row-span-2 lg:self-stretch" : "lg:row-start-1")}
            />
          </div>
        </div>

        {/* 图纸推荐区展示后台返回的分类与图纸卡片，继续承担资料入口角色。 */}
        <section
          className={`mt-8 overflow-hidden bg-transparent p-0 lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:p-6 ${
            isMobile ? `${mobileSectionShell} rounded-[28px] bg-gradient-to-b from-secondary/18 via-secondary/8 to-transparent px-4 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)]` : ""
          }`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold leading-6 lg:text-lg">图纸推荐</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 px-0 text-muted-foreground lg:px-3" asChild>
              <Link href={`/gallery${state.currentCategory && state.currentCategory !== "all" ? `?category=${state.currentCategory}` : ""}`}>
                查看更多
              </Link>
            </Button>
          </div>

          {isMobile ? (
            <div className="mb-4 flex items-center gap-2">
              <PillToggleRail className="flex-1">
                {state.categories.map((item) => (
                  <PillToggleButton
                    key={item.key}
                    selected={state.currentCategory === item.key}
                    shrink
                    onClick={() => void selectCategory(item.key)}
                  >
                    {item.name}
                  </PillToggleButton>
                ))}
              </PillToggleRail>
              <Button variant="outline" size="sm" className="h-9 shrink-0 rounded-full border-0 bg-secondary/70 px-3 text-xs font-medium shadow-none hover:bg-secondary lg:h-8 lg:rounded-md lg:border lg:bg-background lg:px-3 lg:text-sm" asChild>
                <Link href={`/gallery${state.currentCategory && state.currentCategory !== "all" ? `?category=${state.currentCategory}` : ""}`}>
                  更多
                </Link>
              </Button>
            </div>
          ) : (
            <PillToggleRail className="mb-4" mode="wrap">
              {state.categories.map((item) => (
                <PillToggleButton
                  key={item.key}
                  // 当前分类直接切主色，未选中分类维持次级按钮风格。
                  selected={state.currentCategory === item.key}
                  // 分类切换只影响图纸数据区，不会刷新首页其它模块。
                  onClick={() => void selectCategory(item.key)}
                >
                  {item.name}
                </PillToggleButton>
              ))}
            </PillToggleRail>
          )}

          {state.cards.length === 0 ? (
            <StatePanel variant="dashed">
              暂无图纸数据
            </StatePanel>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3">
                {(isMobile ? state.cards.slice(0, 6) : state.cards).map((item) => (
                  <LotteryMediaCard
                    key={item.id}
                    href={`/lottery/${item.id}`}
                    title={item.title}
                    imageUrl={item.cover_image_url}
                    issueText={item.issue}
                    metaText={item.draw_at || "-"}
                    tone="recommend"
                    aspect="poster"
                    className="block rounded-none border-0 bg-transparent hover:scale-[1.01] lg:rounded-xl lg:border lg:border-border/60 lg:bg-secondary/20"
                  />
                ))}
              </div>
              {isMobile && state.cards.length > 6 ? (
                <div className="mt-4 flex justify-center">
                  <Button className="h-10 rounded-full bg-primary px-5 text-sm" asChild>
                    <Link href={`/gallery${state.currentCategory && state.currentCategory !== "all" ? `?category=${state.currentCategory}` : ""}`}>
                      查看更多
                    </Link>
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>

      <Footer />
      {/* 移动导航与悬浮聊天都挂在页面底部，和主内容区解耦。 */}
      <MobileNav />
      <LiveChat />
    </div>
  )
}
