"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles, Gift, Zap } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import type { BannerItem } from "@/src/features/home/model/types"
import { cn } from "@/lib/utils"

interface DisplayBanner {
  id: number
  title: string
  subtitle: string
  description: string
  gradient: string
  borderColor: string
  icon: typeof Gift
  cta: string
  highlight: string
  image_url?: string
  link_url?: string
}

const fallbackBanners: DisplayBanner[] = [
  {
    id: 1 as number,
    title: "新用户专享福利",
    subtitle: "注册即送100元体验金",
    description: "首次充值双倍返利，更多惊喜等你来",
    gradient: "from-primary/20 via-accent/10 to-primary/5",
    borderColor: "border-primary/30",
    icon: Gift,
    cta: "立即领取",
    highlight: "限时优惠",
  },
  {
    id: 2 as number,
    title: "智能AI预测系统",
    subtitle: "大数据分析 精准预测",
    description: "基于千万级数据训练，准确率高达85%",
    gradient: "from-chart-3/20 via-chart-4/10 to-chart-3/5",
    borderColor: "border-chart-3/30",
    icon: Zap,
    cta: "免费体验",
    highlight: "热门推荐",
  },
  {
    id: 3 as number,
    title: "高手排行榜",
    subtitle: "跟单赢大奖",
    description: "实时更新预测达人，跟对人赢大钱",
    gradient: "from-accent/20 via-primary/10 to-accent/5",
    borderColor: "border-accent/30",
    icon: Sparkles,
    cta: "查看排行",
    highlight: "今日必看",
  },
]

interface BannerProps {
  items?: BannerItem[]
  loading?: boolean
}

export function Banner({ items, loading = false }: BannerProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  // 后台没有 banner 时回退到本地默认素材，保证首页首屏始终成立。
  const sourceBanners: DisplayBanner[] =
    items && items.length > 0
      ? items.map((item, index) => ({
          id: item.id || index + 1,
          title: item.title || `活动 ${index + 1}`,
          subtitle: item.type === "official" ? "官方推荐" : "推广活动",
          description: item.type === "official" ? "官方活动资讯" : "限时福利活动",
          gradient: fallbackBanners[index % fallbackBanners.length].gradient,
          borderColor: fallbackBanners[index % fallbackBanners.length].borderColor,
          icon: fallbackBanners[index % fallbackBanners.length].icon,
          cta: "查看详情",
          highlight: item.type === "official" ? "官方" : "广告",
          image_url: item.image_url,
          link_url: item.link_url
        }))
      : fallbackBanners

  useEffect(() => {
    // 自动播放只在用户没有手动操作时生效，避免用户点选后马上被轮播“抢回去”。
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sourceBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, sourceBanners.length])

  const goTo = (index: number) => {
    // 手动切换后临时暂停自动轮播，给用户留出阅读时间。
    setCurrent(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prev = () => goTo((current - 1 + sourceBanners.length) % sourceBanners.length)
  const next = () => goTo((current + 1) % sourceBanners.length)

  const banner = sourceBanners[current]
  const Icon = banner.icon
  const hasBannerImage = !loading && Boolean(banner.image_url)

  const BannerBody = (
    <>
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r transition-all duration-700",
        banner.gradient
      )} />
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 hidden h-full w-1/3 opacity-10 lg:block">
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <Icon className="h-48 w-48 text-primary" strokeWidth={0.5} />
        </div>
      </div>

      {hasBannerImage ? (
        <img
          src={banner.image_url}
          alt={banner.title}
          // banner 图只承担氛围展示作用，透明度交给上层渐变统一兜底。
          className="absolute inset-0 h-full w-full object-cover opacity-75"
          loading="lazy"
        />
      ) : null}

      {/* 没有图片时保留兜底文案；有图片时去掉前景文案层，只保留纯净轮播图。 */}
      {!hasBannerImage ? (
        <div className="relative z-10 flex min-h-[180px] flex-col justify-center bg-gradient-to-r from-background/55 to-transparent px-5 py-5 sm:px-6 md:min-h-[200px] md:p-8 lg:px-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary md:text-xs">
              <Sparkles className="h-3 w-3" />
              {banner.highlight}
            </div>

            <h2 className="mb-2 text-xl font-bold tracking-tight text-foreground md:text-3xl">
              {banner.title}
            </h2>
            {banner.link_url ? (
              <Button className="h-10 rounded-full bg-primary px-5 text-sm text-primary-foreground hover:bg-primary/90 md:h-11 md:rounded-xl" size="lg" asChild>
                <Link href={banner.link_url} target="_blank">
                  {banner.cta}
                </Link>
              </Button>
            ) : (
              <Button className="h-10 rounded-full bg-primary px-5 text-sm text-primary-foreground hover:bg-primary/90 md:h-11 md:rounded-xl" size="lg">
                {banner.cta}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 min-h-[180px] md:min-h-[200px]" aria-hidden="true" />
      )}
    </>
  )

  return (
    <section className="relative mb-5 overflow-hidden rounded-[28px] bg-transparent shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)] lg:mb-6 lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:shadow-none">
      {hasBannerImage && banner.link_url ? (
        <Link
          href={banner.link_url}
          target="_blank"
          aria-label={banner.title}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {BannerBody}
        </Link>
      ) : (
        BannerBody
      )}

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 md:inline-flex"
        onClick={prev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 md:inline-flex"
        onClick={next}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {sourceBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === current 
                ? "w-6 bg-primary" 
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
