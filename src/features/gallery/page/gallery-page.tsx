"use client"

// 图纸板块页负责承接首页图纸区的完整浏览场景：
// 1. 查看全部分类；
// 2. 根据分类切换图纸；
// 3. 保留移动端单行横滑的分类操作方式；
// 4. 提供稳定的“查看更多”落点，而不是让首页不断堆长。
import { useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useIsMobile } from "@/components/ui/hooks/use-mobile"
import { useGalleryData } from "@/src/features/gallery/hooks/use-gallery-data"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { LotteryMediaCard } from "@/src/shared/ui/lottery-media-card"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { PageTitleBar } from "@/src/shared/ui/page-title-bar"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { PillToggleRail } from "@/src/shared/ui/pill-toggle-rail"
import { StatePanel } from "@/src/shared/ui/state-panel"

export function GalleryPage() {
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const requestedCategory = useMemo(() => (searchParams.get("category") || "all").trim() || "all", [searchParams])
  const { state, reload } = useGalleryData(requestedCategory)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <PageTitleBar title="图纸板块" />

        {isMobile ? (
          <PageSectionShell className="mb-4 lg:hidden" padding="compact">
            <PillToggleRail>
              {state.categories.map((item) => (
                <PillToggleButton
                  key={item.key}
                  selected={state.currentCategory === item.key}
                  shrink
                  onClick={() => void reload(item.key)}
                >
                  {item.name}
                </PillToggleButton>
              ))}
            </PillToggleRail>
          </PageSectionShell>
        ) : (
          <PillToggleRail className="mb-4" mode="wrap">
            {state.categories.map((item) => (
              <PillToggleButton
                key={item.key}
                selected={state.currentCategory === item.key}
                onClick={() => void reload(item.key)}
              >
                {item.name}
              </PillToggleButton>
            ))}
          </PillToggleRail>
        )}

        {state.error ? (
          <ErrorBanner>{state.error}</ErrorBanner>
        ) : state.loading ? (
          <StatePanel size="tall">
            图纸板块加载中...
          </StatePanel>
        ) : state.cards.length === 0 ? (
          <StatePanel size="tall">
            当前分类暂无图纸内容
          </StatePanel>
        ) : (
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {state.cards.map((item) => (
              <LotteryMediaCard
                key={item.id}
                href={`/lottery/${item.id}`}
                title={item.title}
                imageUrl={item.cover_image_url}
                issueText={item.issue}
                metaText={item.draw_at || "-"}
              />
            ))}
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
