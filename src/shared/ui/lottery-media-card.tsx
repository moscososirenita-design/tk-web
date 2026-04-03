import Link from "next/link"
import { sanitizeImageURL } from "@/src/shared/security/url"
import { cn } from "@/lib/utils"

type LotteryMediaCardTone = "gallery" | "recommend"
type LotteryMediaCardAspect = "video" | "poster"

interface LotteryMediaCardProps {
  href: string
  title: string
  imageUrl?: string | null
  issueText?: string
  metaText?: string
  tone?: LotteryMediaCardTone
  aspect?: LotteryMediaCardAspect
  className?: string
}

const toneClassMap: Record<LotteryMediaCardTone, string> = {
  // gallery 卡片保留更完整的边框和 hover 边界，适合列表页和桌面网格。
  gallery:
    "overflow-hidden rounded-[24px] bg-secondary/10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all hover:bg-secondary/14 lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:shadow-none lg:hover:border-primary/40 lg:hover:shadow-md",
  // recommend 卡片更轻一些，适合详情页、首页这类嵌入式推荐模块。
  recommend:
    "overflow-hidden rounded-[24px] bg-secondary/14 transition-all hover:bg-secondary/22 hover:shadow-lg",
}

const imageClassMap: Record<LotteryMediaCardAspect, string> = {
  video: "aspect-video w-full object-cover",
  poster: "aspect-[4/5] w-full rounded-2xl object-cover lg:aspect-video lg:rounded-none",
}

export function LotteryMediaCard({
  href,
  title,
  imageUrl,
  issueText,
  metaText,
  tone = "gallery",
  aspect = "video",
  className,
}: LotteryMediaCardProps) {
  const safeImageURL = sanitizeImageURL(imageUrl) || ""

  return (
    <Link href={href} className={cn(toneClassMap[tone], className)}>
      {safeImageURL ? (
        <img src={safeImageURL} alt={title} className={imageClassMap[aspect]} loading="lazy" />
      ) : (
        <div className={cn(imageClassMap[aspect], "bg-secondary/30")} />
      )}
      <div className={cn("space-y-1", aspect === "poster" ? "px-0 pt-2 lg:p-3" : "p-3")}>
        <div className={cn("line-clamp-2 font-semibold text-foreground", aspect === "poster" ? "text-xs leading-5 sm:text-sm" : "text-sm")}>
          {title}
        </div>
        {issueText || metaText ? (
          <div className={cn("text-muted-foreground", aspect === "poster" ? "text-[11px] sm:text-xs" : "text-xs")}>
            {issueText ? `第 ${issueText} 期` : null}
            {issueText && metaText ? " · " : null}
            {metaText || null}
          </div>
        ) : null}
      </div>
    </Link>
  )
}
