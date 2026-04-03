"use client"

// 论坛列表页用于承接帖子列表、分类筛选和搜索入口，是论坛域的主入口。
import { useState } from "react"
import { PenSquare } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { Input } from "@/components/ui/forms/input"
import { Textarea } from "@/components/ui/forms/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog"
import { useForumData } from "@/src/features/forum/hooks/use-forum-data"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/src/shared/utils/date"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { ForumTopicCard } from "@/src/shared/ui/forum-topic-card"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { PageTitleBar } from "@/src/shared/ui/page-title-bar"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { PillToggleRail } from "@/src/shared/ui/pill-toggle-rail"
import { SearchActionBar } from "@/src/shared/ui/search-action-bar"
import { StatePanel } from "@/src/shared/ui/state-panel"

export function ForumPage() {
  const { state, clearSearch, createTopic, submitSearch, setFeed, setHistoryIssue, setHistoryYear, setKeyword } =
    useForumData()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerTitle, setComposerTitle] = useState("")
  const [composerContent, setComposerContent] = useState("")
  const [composerCover, setComposerCover] = useState("")
  const [composerTip, setComposerTip] = useState("")

  const submitTopic = async () => {
    if (!composerTitle.trim()) {
      setComposerTip("请先填写帖子标题")
      return
    }
    if (!composerContent.trim()) {
      setComposerTip("请先填写帖子正文")
      return
    }

    try {
      await createTopic({
        title: composerTitle.trim(),
        content: composerContent.trim(),
        cover_image: composerCover.trim(),
      })
      setComposerOpen(false)
      setComposerTitle("")
      setComposerContent("")
      setComposerCover("")
      setComposerTip("")
    } catch (error) {
      setComposerTip(error instanceof Error ? error.message : "发帖失败")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <PageTitleBar
          title="社区论坛"
          actions={
            <Button className="gap-2" onClick={() => setComposerOpen(true)}>
              <PenSquare className="h-4 w-4" />
              发布帖子
            </Button>
          }
        />

        <PageSectionShell className="mb-4 lg:p-4" padding="page">
          <div className="relative mb-3 h-[44px] lg:h-[40px]">
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                searchExpanded ? "hidden lg:block lg:opacity-100" : "block opacity-100"
              )}
            >
              <PillToggleRail className="pr-14 lg:pr-0" mode="adaptive">
                {state.tabs.map((tab) => (
                  <PillToggleButton
                    key={tab.key}
                    // 顶部 feed 切换直接驱动 hook 内的请求条件变化。
                    selected={tab.key === state.feed}
                    className={tab.key === state.feed ? "" : "hover:bg-secondary/80"}
                    onClick={() => {
                      // 当前 feed 已激活但仍残留搜索条件时，允许再次点击直接恢复完整列表。
                      if (tab.key === state.feed && state.committedKeyword) {
                        clearSearch()
                        setSearchExpanded(false)
                        return
                      }
                      setFeed(tab.key)
                    }}
                  >
                    {tab.label}
                  </PillToggleButton>
                ))}
              </PillToggleRail>
            </div>
            <SearchActionBar
              value={state.keyword}
              onChange={setKeyword}
              onSubmit={submitSearch}
              placeholder="按标题或作者搜索"
              className="absolute right-0 top-0 z-10"
              expandedClassName="w-[min(13rem,calc(100vw-5.5rem))] lg:w-[20rem]"
              triggerClassName="h-11 w-11 rounded-[16px] lg:h-10 lg:w-10 lg:rounded-md"
              onExpandedChange={(expanded) => {
                setSearchExpanded(expanded)
                if (!expanded) {
                  clearSearch()
                }
              }}
            />
          </div>

          {state.feed === "history" ? (
            <div className="mt-3 space-y-2">
              {/* 历史模式才展示年份和期号筛选，普通 feed 保持更轻的论坛浏览体验。 */}
              <PillToggleRail>
                {state.years.map((year) => (
                  <PillToggleButton
                    key={year}
                    selected={state.selectedYear === year}
                    size="xs"
                    shrink
                    onClick={() => setHistoryYear(year)}
                  >
                    {year} 年
                  </PillToggleButton>
                ))}
              </PillToggleRail>
              <PillToggleRail>
                {state.issues.map((issue) => (
                  <PillToggleButton
                    key={issue}
                    selected={state.selectedIssue === issue}
                    size="xs"
                    shrink
                    onClick={() => setHistoryIssue(issue)}
                  >
                    {issue}
                  </PillToggleButton>
                ))}
              </PillToggleRail>
            </div>
          ) : null}
        </PageSectionShell>

        {state.error ? <ErrorBanner className="mb-4">{state.error}</ErrorBanner> : null}

        {state.loading ? (
          <StatePanel>加载中...</StatePanel>
        ) : state.items.length === 0 ? (
          <StatePanel>暂无帖子内容</StatePanel>
        ) : (
          <section className="space-y-4">
            {state.items.map((item) => (
              <ForumTopicCard
                key={item.id}
                href={`/forum/${item.id}`}
                title={item.title}
                summary={item.content_preview || "暂无摘要"}
                commentCount={item.comment_count}
                likeCount={item.like_count}
                createdAtText={formatRelativeTime(item.created_at)}
                coverImage={item.cover_image || "/placeholder.jpg"}
              />
            ))}
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>发布新帖子</DialogTitle>
            <DialogDescription>登录后可发布社区内容，标题和正文将立即生效。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">标题</label>
              <Input
                value={composerTitle}
                onChange={(event) => setComposerTitle(event.target.value)}
                placeholder="请输入帖子标题（最多 160 字）"
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">封面图 URL（可选）</label>
              <Input
                value={composerCover}
                onChange={(event) => setComposerCover(event.target.value)}
                placeholder="https://example.com/cover.jpg"
                maxLength={800}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">正文</label>
              <Textarea
                value={composerContent}
                onChange={(event) => setComposerContent(event.target.value)}
                placeholder="写下你的观点..."
                rows={8}
                maxLength={6000}
              />
              <p className="text-xs text-muted-foreground">{composerContent.length}/6000</p>
            </div>

            {composerTip ? <p className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">{composerTip}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposerOpen(false)}>
              取消
            </Button>
            <Button onClick={() => void submitTopic()} disabled={state.creating}>
              {state.creating ? "发布中..." : "确认发布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
