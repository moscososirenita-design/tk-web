"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarClock, ExternalLink, Flame, History, PlayCircle, RefreshCw, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { useLotteryDetailData } from "@/src/features/lottery/hooks/use-lottery-detail-data"
import type { LotteryCommentItem, LotteryDetailBanner } from "@/src/features/lottery/model/types"
import {
  buildCommentGroups,
  buildDetailBalls,
  buildHistoryPreviewItems,
  buildLotteryDetailMeta,
  type CommentTabKey,
} from "@/src/features/lottery/model/lottery-detail-view-model"
import { formatDateTime, formatRelativeTime } from "@/src/shared/utils/date"
import { sanitizeImageURL, sanitizeOutboundURL } from "@/src/shared/security/url"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { LotteryBallRow } from "@/src/shared/ui/lottery-ball-row"
import { LotteryMediaCard } from "@/src/shared/ui/lottery-media-card"
import { MetricTile } from "@/src/shared/ui/metric-tile"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { StatePanel } from "@/src/shared/ui/state-panel"
import { cn } from "@/lib/utils"

interface LotteryDetailPageProps {
  lotteryInfoID: number
}

function resolveBannerHref(item: LotteryDetailBanner): string {
  return sanitizeOutboundURL(item.jump_url || item.link_url || "")
}

function CommentList({ items }: { items: LotteryCommentItem[] }) {
  if (items.length === 0) {
    return (
      <StatePanel className="rounded-2xl bg-secondary/15 px-4 shadow-none lg:border-0 lg:bg-secondary/15">
        暂无评论内容
      </StatePanel>
    )
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 8).map((comment) => (
        <article key={comment.id} className="rounded-2xl bg-secondary/18 px-4 py-3">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-foreground">
                {comment.nickname || comment.username || `用户${comment.user_id}`}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {comment.user_type || "用户"}
              </div>
            </div>
            <div className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </div>
          </div>
          <p className="text-sm leading-6 text-foreground/92">{comment.content}</p>
          <div className="mt-2 text-[11px] text-muted-foreground">点赞 {comment.likes}</div>
        </article>
      ))}
    </div>
  )
}

export function LotteryDetailPage({ lotteryInfoID }: LotteryDetailPageProps) {
  const { state, reload } = useLotteryDetailData(lotteryInfoID)
  const [activeCommentTab, setActiveCommentTab] = useState<CommentTabKey>("system")

  // detail 承接图纸主详情与结果域合并后的最终数据。
  const detail = state.detail
  // drawDetail 承接开奖玩法 bundle，给摘要卡和后续扩展玩法区使用。
  const drawDetail = state.drawDetail
  // history 收敛的是同图纸相关往期开奖数据，供详情页快速回看。
  const history = state.history
  const current = detail?.current || null
  const drawBalls = useMemo(
    () =>
      current
        ? buildDetailBalls(current.draw_numbers || [], current.draw_labels || [], current.color_labels || [])
        : { normals: [], bonus: null },
    [current]
  )
  const commentGroups = useMemo(() => buildCommentGroups(detail), [detail])
  const detailMeta = useMemo(() => buildLotteryDetailMeta(detail, drawDetail), [detail, drawDetail])
  const historyPreviewItems = useMemo(
    () => buildHistoryPreviewItems(history, current?.draw_record_id || 0, 6),
    [current?.draw_record_id, history]
  )
  const activeComments = commentGroups.find((group) => group.key === activeCommentTab)?.items || []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={detailMeta.historyHref}>
                <History className="h-4 w-4" />
                开奖历史
              </Link>
            </Button>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground" asChild>
              <Link href={detailMeta.sceneHref}>
                <PlayCircle className="h-4 w-4" />
                开奖现场
              </Link>
            </Button>
            {detailMeta.playbackURL ? (
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={detailMeta.playbackURL} target="_blank" rel="noreferrer">
                  <PlayCircle className="h-4 w-4" />
                  观看回放
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {state.loading ? (
          <StatePanel size="tall">
            彩票详情加载中...
          </StatePanel>
        ) : state.error ? (
          <ErrorBanner
            action={
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void reload()}>
                <RefreshCw className="h-4 w-4" />
                重试
              </Button>
            }
          >
            {state.error}
          </ErrorBanner>
        ) : !detail || !current ? (
          <StatePanel size="tall">
            当前图纸不存在
          </StatePanel>
        ) : (
          <div className="space-y-6">
            <PageSectionShell tone="hero" padding="page">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    图纸详情
                  </div>
                  <h1 className="mt-3 text-2xl font-black leading-tight text-foreground md:text-3xl">
                    {current.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-semibold">第 {detailMeta.issueText || current.issue} 期</span>
                    {detailMeta.drawAtText ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        {formatDateTime(detailMeta.drawAtText)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {detail.show_metrics ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <MetricTile label="点赞" value={current.likes_count} className="bg-secondary/30 px-4 py-3" valueClassName="text-lg font-black" labelClassName="font-medium" />
                  <MetricTile label="评论" value={current.comment_count} className="bg-secondary/30 px-4 py-3" valueClassName="text-lg font-black" labelClassName="font-medium" />
                  <MetricTile label="收藏" value={current.favorite_count} className="bg-secondary/30 px-4 py-3" valueClassName="text-lg font-black" labelClassName="font-medium" />
                  <MetricTile label="阅读" value={current.read_count} className="bg-secondary/30 px-4 py-3" valueClassName="text-lg font-black" labelClassName="font-medium" />
                </div>
              ) : null}
            </PageSectionShell>

            <PageSectionShell padding="none">
              <div className="relative min-h-[260px] overflow-hidden rounded-[26px] bg-secondary/20 md:min-h-[380px] lg:rounded-2xl">
                {sanitizeImageURL(current.detail_image_url) ? (
                  <img
                    src={sanitizeImageURL(current.detail_image_url)}
                    alt={current.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary/25 text-sm text-muted-foreground">
                    暂无详情图片
                  </div>
                )}
              </div>
            </PageSectionShell>

            <PageSectionShell>
              <div className="mb-3 flex items-center gap-2 text-lg font-black">
                <Zap className="h-4 w-4 text-primary" />
                <span>开奖信息</span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">第 {current.draw_issue || current.issue} 期</span>
                {detailMeta.drawAtText ? (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-4 w-4" />
                    {formatDateTime(detailMeta.drawAtText)}
                  </span>
                ) : null}
              </div>

              <LotteryBallRow balls={drawBalls} size="large" />
            </PageSectionShell>

            {detail.issues.length > 0 ? (
              <PageSectionShell>
                {/* 期号切换直接走详情页动态路由，保持“一个图纸一个 URL”的结构稳定。 */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">期号切换</h2>
                    <p className="mt-1 text-sm text-muted-foreground">直接切换到同彩种的其他图纸期号</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    共 {detail.issues.length} 期
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detail.issues.map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/lottery/${issue.id}`}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-black transition-all",
                        issue.id === lotteryInfoID
                          ? "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "border-border/50 bg-secondary/55 text-foreground/85 hover:border-primary/20 hover:bg-primary/8 hover:text-primary"
                      )}
                    >
                      {issue.year}-{issue.issue}
                    </Link>
                  ))}
                </div>
              </PageSectionShell>
            ) : null}

            {detail.poll_options.length > 0 ? (
              <PageSectionShell>
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-black">投票热度</h2>
                </div>
                <div className="space-y-3">
                  {detail.poll_options.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">{option.name}</span>
                        <span className="text-xs font-black text-primary">
                          {option.votes} 票 · {option.percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-secondary/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-primary to-orange-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, option.percent))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </PageSectionShell>
            ) : null}

            {drawDetail ? (
              <PageSectionShell>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-black">玩法结果摘要</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-secondary/22 p-4">
                    <div className="text-xs font-medium text-muted-foreground">特码</div>
                    <div className="mt-2 text-lg font-black text-foreground">
                      {drawDetail.result_bundle.special_result.special_number} · {drawDetail.result_bundle.special_result.special_color_wave}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {drawDetail.result_bundle.special_result.special_big_small} / {drawDetail.result_bundle.special_result.special_single_double}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary/22 p-4">
                    <div className="text-xs font-medium text-muted-foreground">合数 / 尾数</div>
                    <div className="mt-2 text-lg font-black text-foreground">
                      {drawDetail.result_bundle.special_result.special_sum_single_double}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {drawDetail.result_bundle.special_result.special_tail_big_small}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary/22 p-4">
                    <div className="text-xs font-medium text-muted-foreground">总分</div>
                    <div className="mt-2 text-lg font-black text-foreground">
                      {drawDetail.result_bundle.regular_result.total_sum}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {drawDetail.result_bundle.regular_result.total_big_small} / {drawDetail.result_bundle.regular_result.total_single_double}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary/22 p-4">
                    <div className="text-xs font-medium text-muted-foreground">七码统计</div>
                    <div className="mt-2 text-lg font-black text-foreground">
                      单 {drawDetail.result_bundle.count_result.odd_count} / 双 {drawDetail.result_bundle.count_result.even_count}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      大 {drawDetail.result_bundle.count_result.big_count} / 小 {drawDetail.result_bundle.count_result.small_count}
                    </div>
                  </div>
                </div>
              </PageSectionShell>
            ) : null}

            {historyPreviewItems.length > 0 ? (
              <PageSectionShell>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">关联开奖记录</h2>
                    <p className="mt-1 text-sm text-muted-foreground">从当前图纸直接回看相关期号的开奖结果</p>
                  </div>
                  {current?.special_lottery_id ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/history?tabId=${current.special_lottery_id}`}>查看更多</Link>
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {historyPreviewItems.map((item) => {
                    const previewBalls = buildDetailBalls(item.numbers, item.previewLabels, item.color_labels)
                    const sceneHref = `/draw-scene?tabId=${item.special_lottery_id || current?.special_lottery_id || 0}&issue=${encodeURIComponent(item.issue)}`
                    return (
                      <Link
                        key={item.id}
                        href={sceneHref}
                        className="rounded-[24px] bg-secondary/16 p-4 transition-all hover:bg-secondary/24 hover:shadow-lg"
                      >
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div>
                            <div className="text-base font-black text-foreground">
                              第 <span className="text-primary">{item.issue}</span> 期
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.draw_time || item.draw_at)}</div>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">
                            {item.special_lottery_name || "开奖"}
                          </span>
                        </div>

                        <LotteryBallRow balls={previewBalls} size="compact" />

                        <div className="mt-3 text-xs text-muted-foreground">
                          特码 {item.special_code || item.special_draw_result || "--"} · {item.special_big_small || "--"} / {item.special_single_double || "--"}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </PageSectionShell>
            ) : null}

            {detail.detail_banners.length > 0 ? (
              <PageSectionShell>
                <h2 className="mb-4 text-lg font-black">详情 Banner</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {detail.detail_banners.map((banner) => {
                    const bannerHref = resolveBannerHref(banner)
                    const content = (
                      <div className="relative overflow-hidden rounded-[24px] bg-secondary/20">
                        {sanitizeImageURL(banner.image_url) ? (
                          <img
                            src={sanitizeImageURL(banner.image_url)}
                            alt={banner.title}
                            className="aspect-[16/8] w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="aspect-[16/8] w-full bg-secondary/30" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                          <div className="text-sm font-black text-white">{banner.title}</div>
                        </div>
                      </div>
                    )

                    return bannerHref ? (
                      <a
                        key={banner.id}
                        href={bannerHref}
                        target={bannerHref.startsWith("http") ? "_blank" : undefined}
                        rel={bannerHref.startsWith("http") ? "noreferrer" : undefined}
                        className="block transition-transform hover:scale-[1.01]"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={banner.id}>{content}</div>
                    )
                  })}
                </div>
              </PageSectionShell>
            ) : null}

            {detail.recommend_items.length > 0 ? (
              <PageSectionShell>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black">推荐图纸</h2>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/gallery">查看图库</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {detail.recommend_items.map((item) => (
                    <LotteryMediaCard
                      key={item.id}
                      href={`/lottery/${item.id}`}
                      title={item.title}
                      imageUrl={item.cover_image_url}
                      issueText={item.issue}
                      tone="recommend"
                    />
                  ))}
                </div>
              </PageSectionShell>
            ) : null}

            {(detail.external_links.length > 0 || commentGroups.some((group) => group.items.length > 0)) ? (
              <section className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
                <PageSectionShell as="div">
                  <div className="mb-4 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-black">相关入口</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.external_links.length > 0 ? (
                      detail.external_links.map((item) => {
                        const href = sanitizeOutboundURL(item.url)
                        return href ? (
                          <a
                            key={item.id}
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noreferrer" : undefined}
                            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/16"
                          >
                            {item.name}
                          </a>
                        ) : null
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground">暂无外链入口</div>
                    )}
                  </div>
                </PageSectionShell>

                <PageSectionShell as="div">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {commentGroups.map((group) => (
                      <button
                        key={group.key}
                        type="button"
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-black transition-all",
                          activeCommentTab === group.key
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                        )}
                        onClick={() => setActiveCommentTab(group.key)}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                  <CommentList items={activeComments} />
                </PageSectionShell>
              </section>
            ) : null}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
