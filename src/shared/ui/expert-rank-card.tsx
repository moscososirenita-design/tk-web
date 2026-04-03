import type { ReactNode } from "react"
import { TrendingUp } from "lucide-react"
import type { ExpertItem } from "@/src/features/experts/model/types"
import { MetricTile } from "@/src/shared/ui/metric-tile"

interface ExpertRankCardProps {
  item: ExpertItem
  trendRate: number
  followCountText: string
  actions?: ReactNode
}

// ... existing code ...

/**
 * 专家排行榜卡片组件
 *
 * 展示专家的详细信息，包括排名、头像、昵称、认证信息、各项指标数据以及近期状态进度条
 *
 * @param item - 专家数据对象，包含排名、头像、昵称、用户类型、命中率、连中数、回报率等信息
 * @param trendRate - 近期状态百分比数值，用于显示进度条
 * @param followCountText - 关注量的文本显示值
 * @param actions - 可选的操作按钮区域，显示在卡片右侧
 * @returns 返回一个专家排行榜卡片组件
 */
export function ExpertRankCard({ item, trendRate, followCountText, actions }: ExpertRankCardProps) {
  return (
    /* 卡片容器，包含响应式样式和悬停效果 */
    <article className="rounded-[26px] bg-secondary/10 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all hover:bg-secondary/15 lg:rounded-2xl lg:border lg:border-border/60 lg:bg-background/40 lg:p-5 lg:shadow-none lg:hover:border-primary/35">
      {/* 主布局网格，在大屏时分为内容区和操作区两列 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          {/* 头部信息区域：包含排名、头像和用户基本信息 */}
          <div className="flex items-start gap-3">
            {/* 排名徽章，圆形样式 */}
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-sm font-semibold text-primary">
              {item.rank}
            </span>
            {/* 用户头像图片 */}
            <img
              src={item.avatar || "/placeholder-user.jpg"}
              alt={item.nickname || "高手"}
              className="h-12 w-12 rounded-full border border-border/60 object-cover"
              loading="lazy"
            />

            {/* 用户信息区域：包含昵称、标签和简介 */}
            <div className="min-w-0">
              {/* 昵称和标签行 */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">{item.nickname || `用户${item.user_id}`}</h3>
                <span className="rounded-full border border-border/70 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
                  {item.user_type || "分析师"}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  认证
                </span>
              </div>
              {/* 专家评分标签或简介描述 */}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.score_label || "结合走势与热度进行综合研判"}
              </p>
            </div>
          </div>

          {/* 核心指标数据网格，2 列布局，大屏时 4 列 */}
          <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
            <MetricTile label="命中率" value={`${item.hit_rate}%`} className="lg:bg-card/70" valueClassName="text-xl font-bold text-emerald-400" />
            <MetricTile label="连中" value={item.streak} className="lg:bg-card/70" valueClassName="text-xl font-bold text-rose-400" />
            <MetricTile label="回报率" value={`${item.return_rate}%`} className="lg:bg-card/70" valueClassName="text-xl font-bold text-foreground" />
            <MetricTile label="关注量" value={followCountText} className="lg:bg-card/70" valueClassName="text-xl font-bold text-foreground" />
          </div>

          {/* 近期状态进度条区域 */}
          <div className="mt-4">
            {/* 进度条标题和百分比数值 */}
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                近期状态
              </span>
              <span>{trendRate}%</span>
            </div>
            {/* 进度条背景和渐变填充条 */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-rose-500"
                style={{ width: `${trendRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 右侧操作按钮区域，仅在提供 actions 时渲染 */}
        {actions ? <div className="flex flex-row gap-2 lg:flex-col lg:justify-center">{actions}</div> : null}
      </div>
    </article>
  )
}

