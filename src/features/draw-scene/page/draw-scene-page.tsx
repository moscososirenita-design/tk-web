"use client"

// 开奖现场页承接首页“查看详情”的细化场景：
// 1. 彩种由上一路由决定（首页/历史页/图纸详情传入 tabId）；
// 2. 展示当前期开奖号码和下期预告；
// 3. 预留当前直播/历史回放视频位；
// 4. 把 tabId / issue 同步进 URL，方便分享与返回定位。
import { useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarClock, PlayCircle, Video, Zap } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { useDrawSceneData } from "@/src/features/draw-scene/hooks/use-draw-scene-data"
import { formatDateTime } from "@/src/shared/utils/date"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { LotteryBallRow } from "@/src/shared/ui/lottery-ball-row"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { StatePanel } from "@/src/shared/ui/state-panel"

export function DrawScenePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTabID = useMemo(() => {
    // 允许从首页热门彩种或开奖卡直接带 tabId 进入页面。
    const value = Number(searchParams.get("tabId") || 0)
    return Number.isFinite(value) && value > 0 ? value : 0
  }, [searchParams])
  // issue 参数允许我们直达某一期的开奖现场。
  const requestedIssue = searchParams.get("issue") || ""
  const { state, selection, selectIssue } = useDrawSceneData(requestedTabID, requestedIssue)
  const { selectedItem, selectedVideoURL, sceneBalls, videoItems } = selection

  const syncRoute = useCallback(
    (tabID: number, issue = "") => {
      // 使用 replace 而不是 push，避免用户切期号时浏览器历史堆得太长。
      const params = new URLSearchParams()
      if (tabID > 0) params.set("tabId", String(tabID))
      if (issue) params.set("issue", issue)
      router.replace(`/draw-scene?${params.toString()}`, { scroll: false })
    },
    [router]
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <div className="mb-4">
          <h1 className="text-xl font-bold md:text-2xl">开奖现场</h1>
        </div>

        <PageSectionShell padding="page">
          {state.error ? (
            <ErrorBanner>{state.error}</ErrorBanner>
          ) : state.loading ? (
            <StatePanel className="lg:bg-background/40" size="tall">
              开奖现场加载中...
            </StatePanel>
          ) : !selectedItem ? (
            <StatePanel className="lg:bg-background/40" size="tall">
              暂无开奖现场数据
            </StatePanel>
          ) : (
            <div className="space-y-6">
              <PageSectionShell className="rounded-[26px] from-secondary/20 via-secondary/10 lg:border-primary/30 lg:bg-background/70" padding="compact">
                {/* 摘要卡集中展示：期号、开奖时间、号码球、历史入口、下期预告。 */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xl font-bold md:text-2xl">
                      <Zap className="h-4 w-4 text-primary md:h-5 md:w-5" />
                      <span>第</span>
                      <span className="text-primary">{selectedItem.issue}</span>
                      <span>期</span>
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      {formatDateTime(selectedItem.draw_at)}
                    </p>
                  </div>

                  <Button variant="ghost" className="h-[34px] rounded-full bg-primary/10 px-3 text-[12px] font-black text-primary hover:bg-primary/15 hover:text-primary" asChild>
                    <Link href={`/history?tabId=${state.activeTabID}`}>
                      查看历史记录
                    </Link>
                  </Button>
                </div>

                <LotteryBallRow balls={sceneBalls} size="large" />

                <p className="mt-4 text-center text-sm text-primary">
                  下期预告：第 {state.dashboard?.special_lottery?.current_issue || "--"} 期 {formatDateTime(state.dashboard?.special_lottery?.next_draw_at || "")}
                </p>
              </PageSectionShell>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">开奖回放</h2>
                </div>

                <div className="overflow-hidden rounded-[26px] bg-secondary/10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:rounded-2xl lg:border lg:border-border/60 lg:bg-card lg:shadow-none">
                  {selectedVideoURL ? (
                    // 已有可播放地址时，主区域直接变成视频播放器。
                    <video
                      key={`${state.activeTabID}-${selectedItem.issue}-${selectedVideoURL}`}
                      className="aspect-video w-full bg-slate-950 object-cover"
                      controls
                      playsInline
                      poster={selectedItem.cover_image_url || "/placeholder.jpg"}
                    >
                      <source src={selectedVideoURL} />
                    </video>
                  ) : (
                    // 暂无视频时也保留固定比例的视频位，这样未来接真实回放时不用再改布局。
                    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-slate-950/90 text-center text-white">
                      <Video className="h-10 w-10 text-primary" />
                      <p className="text-lg font-semibold">当前期暂无可播放视频</p>
                      <p className="text-sm text-white/65">已保留历史开奖视频播放位，后续接入后台回放地址即可直接显示</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">历史开奖视频</h2>
                  <Link href={`/history?tabId=${state.activeTabID}`} className="text-sm font-medium text-primary hover:text-primary/80">
                    更多开奖回放 &gt;&gt;
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videoItems.map((item) => {
                    const isActive = item.issue === selectedItem.issue
                    const itemVideoURL = item.playback_url || item.video_url || ""
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          // 先本地切中，保证交互立即响应；再同步回 URL，保证可分享。
                          selectIssue(item.issue)
                          syncRoute(state.activeTabID, item.issue)
                        }}
                        className={`overflow-hidden rounded-[24px] text-left transition-all lg:rounded-xl ${
                          isActive
                            ? "bg-primary/8 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:border lg:border-primary lg:shadow-lg lg:shadow-primary/15"
                            : "bg-secondary/10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.12)] hover:bg-secondary/14 lg:border lg:border-border/60 lg:shadow-none lg:hover:border-primary/40 lg:hover:shadow-md"
                        }`}
                      >
                        <div className="relative aspect-video bg-slate-200">
                          <img
                            src={item.cover_image_url || "/placeholder.jpg"}
                            alt={`${item.issue}期开奖视频`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 shadow-lg">
                              <PlayCircle className="h-8 w-8 text-primary" />
                            </span>
                          </div>
                          {!itemVideoURL ? (
                            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                              占位
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="font-semibold text-foreground">{item.issue}期开奖结果视频</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(item.draw_at)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        </PageSectionShell>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
