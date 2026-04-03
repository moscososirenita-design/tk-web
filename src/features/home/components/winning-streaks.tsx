"use client"

// 连中榜单是首页右侧的高手入口，强调“谁在连中、谁值得继续跟踪”。
import Link from "next/link"
import { Trophy, Crown, Star, Medal, ChevronRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import type { ExpertItem } from "@/src/features/experts/model/types"
import { cn } from "@/lib/utils"

interface WinningStreaksProps {
  experts?: ExpertItem[]
  limit?: number
  className?: string
}

const fallbackData = [
  {
    id: 1,
    username: "幸运之星",
    avatar: "🎯",
    streak: 12,
    accuracy: "92%",
    followers: 15680,
    badge: "crown",
    isLive: true,
  },
  {
    id: 2,
    username: "六合大师",
    avatar: "🔮",
    streak: 9,
    accuracy: "88%",
    followers: 12340,
    badge: "star",
    isLive: false,
  },
  {
    id: 3,
    username: "神算子",
    avatar: "🎲",
    streak: 7,
    accuracy: "85%",
    followers: 9870,
    badge: "medal",
    isLive: true,
  },
]

const badgeIcons: Record<string, typeof Crown> = {
  crown: Crown,
  star: Star,
  medal: Medal,
  trophy: Trophy,
}

export function WinningStreaks({ experts, limit = 6, className }: WinningStreaksProps) {
  const source =
    experts && experts.length > 0
      ? experts.slice(0, limit).map((item, index) => ({
          id: item.user_id || index + 1,
          username: item.nickname || `用户${item.user_id}`,
          avatar: item.avatar || "",
          streak: item.streak,
          accuracy: `${item.hit_rate}%`,
          followers: Math.max(1000, Math.round(item.return_rate * 120)),
          badge: index === 0 ? "crown" : index === 1 ? "star" : index === 2 ? "medal" : "trophy",
          isLive: index % 2 === 0,
        }))
      : []

  // 当真实榜单不足 limit 时补上演示位，避免右侧区域出现明显留白。
  while (source.length < limit) {
    const fallback = fallbackData[source.length % fallbackData.length]
    const index = source.length
    source.push({
      ...fallback,
      id: -(index + 1),
      username: `${fallback.username}${index + 1}`,
      badge: index === 0 ? "crown" : index === 1 ? "star" : index === 2 ? "medal" : "trophy",
      isLive: index % 2 === 0,
    })
  }

  return (
    <section
      className={cn(
        "relative w-full min-w-0 max-w-full overflow-hidden bg-transparent p-0 lg:flex lg:h-full lg:flex-col lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:p-5",
        className
      )}
    >
      <div className="absolute -left-10 -top-10 hidden h-32 w-32 rounded-full bg-primary/10 blur-3xl lg:block" />

      <div className="mb-5 flex items-start justify-between gap-3 md:items-center lg:mb-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 lg:rounded-xl">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[18px] font-bold leading-6 text-foreground md:text-lg">连中排行榜</h2>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-muted-foreground" asChild>
          <Link href="/experts">
            全部高手 <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-0 lg:flex-1 lg:space-y-2.5">
        {source.map((winner, index) => {
          // badge 字段统一转成图标组件，方便下面按名渲染。
          const BadgeIcon = winner.badge ? badgeIcons[winner.badge] : null

          return (
            <div
              key={winner.id}
              // 单条榜单卡片保持轻 hover，避免抢过左侧开奖主卡的焦点。
              className="group relative flex w-full min-w-0 items-center gap-2.5 rounded-2xl bg-secondary/10 px-3 py-3.5 transition-all duration-300 hover:bg-secondary/18 md:gap-3 md:py-3 lg:rounded-xl lg:border lg:border-border/50 lg:bg-secondary/30 lg:px-3 lg:py-3 lg:hover:border-primary/50 lg:hover:bg-secondary/50"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold lg:rounded-lg",
                  index === 0
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
                    : index === 2
                    ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {index + 1}
              </div>

              <div className="relative">
                {winner.avatar?.startsWith("http") || winner.avatar?.startsWith("/") ? (
                  <img src={winner.avatar} alt={winner.username} className="h-10 w-10 rounded-full object-cover md:h-11 md:w-11" loading="lazy" />
                ) : (
                  // 没有头像时回退到 emoji / 占位字符，保证榜单不会出现空头像框。
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xl md:h-11 md:w-11 md:text-2xl">
                    {winner.avatar || "👤"}
                  </div>
                )}
                {winner.isLive && (
                  // 小圆点用于提示当前高手近期仍然活跃，不代表真实直播状态。
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent-foreground" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-semibold leading-6 text-foreground md:text-base">
                    {winner.username}
                  </span>
                  {BadgeIcon && (
                    <BadgeIcon
                      className={cn(
                        "h-4 w-4",
                        winner.badge === "crown"
                          ? "text-amber-400"
                          : winner.badge === "star"
                          ? "text-blue-400"
                          : winner.badge === "medal"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-5 text-muted-foreground md:text-sm">
                  <span>{winner.followers.toLocaleString()} 粉丝</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {winner.accuracy}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xl font-bold text-primary md:text-2xl">{winner.streak}</div>
                <div className="text-[10px] text-muted-foreground md:text-xs">连中</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
