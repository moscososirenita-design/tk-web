import Link from "next/link"
import { Calendar, MessageCircle } from "lucide-react"

interface ForumTopicCardProps {
  href: string
  title: string
  summary: string
  commentCount: number
  likeCount: number
  createdAtText: string
  coverImage: string
}

export function ForumTopicCard({
  href,
  title,
  summary,
  commentCount,
  likeCount,
  createdAtText,
  coverImage,
}: ForumTopicCardProps) {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <article className="rounded-[26px] bg-secondary/10 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all hover:bg-secondary/15 focus-visible:ring-2 focus-visible:ring-primary/45 lg:rounded-xl lg:border lg:border-border/60 lg:bg-card/95 lg:shadow-none lg:hover:border-primary/40 lg:hover:bg-card">
        <div className="grid gap-3 md:grid-cols-[1fr_188px] md:items-center md:gap-4">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary">
              {title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{summary || "暂无摘要"}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount}
              </span>
              <span>点赞 {likeCount}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {createdAtText}
              </span>
            </div>
          </div>

          <div className="relative block overflow-hidden rounded-2xl bg-secondary/18 lg:rounded-lg lg:border lg:border-border/60 lg:bg-secondary/30">
            <img
              src={coverImage || "/placeholder.jpg"}
              alt={title}
              className="h-[116px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
        </div>
      </article>
    </Link>
  )
}
