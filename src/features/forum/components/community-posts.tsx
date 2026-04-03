"use client"

// 社区精选卡片用于把论坛热点帖子以更强视觉化的方式放到首页或推荐区。
import { useMemo, useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Eye, Flame, ChevronRight, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import type { ForumTopicItem } from "@/src/features/forum/model/types"
import { formatRelativeTime } from "@/src/shared/utils/date"
import { PillToggleButton } from "@/src/shared/ui/pill-toggle-button"
import { PillToggleRail } from "@/src/shared/ui/pill-toggle-rail"
import { StatePanel } from "@/src/shared/ui/state-panel"
import { cn } from "@/lib/utils"

interface CommunityPostsProps {
  posts?: ForumTopicItem[]
  loading?: boolean
}

const fallbackCategories = [
  { id: "all", label: "全部" },
  { id: "official", label: "官方" },
  { id: "user", label: "用户" },
]

const fallbackPosts = [
  {
    id: 1,
    title: "澳彩2026-068期 定位码冲击",
    author: "神算子",
    avatar: "🎯",
    views: 12580,
    likes: 856,
    comments: 234,
    category: "user",
    isHot: true,
    thumbnail: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400&h=300&fit=crop",
    timeAgo: "2小时前",
  },
]

export function CommunityPosts({ posts, loading = false }: CommunityPostsProps) {
  const [activeCategory, setActiveCategory] = useState("all")

  const normalizedPosts = useMemo(
    () =>
      posts && posts.length > 0
        ? posts.map((item, index) => ({
            id: item.id,
            title: item.title,
            author: item.user?.nickname || item.user?.username || `用户${item.user_id}`,
            avatar: item.user?.avatar || "",
            views: Math.max(1000, Math.round(item.like_count * 10 + item.comment_count * 8)),
            likes: item.like_count,
            comments: item.comment_count,
            category: item.is_official ? "official" : "user",
            isHot: index < 2,
            thumbnail: item.cover_image || "/placeholder.jpg",
            timeAgo: formatRelativeTime(item.created_at),
          }))
        : fallbackPosts,
    [posts]
  )

  // 分类切换只在前端本地过滤，避免为了轻量交互重复请求论坛接口。
  const filteredPosts =
    activeCategory === "all"
      ? normalizedPosts
      : normalizedPosts.filter((post) => post.category === activeCategory)

  return (
    <section className="relative">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/60">
            <ImageIcon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">社区精选</h2>
            <p className="text-sm text-muted-foreground">已切换为后端实时帖子</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
          <Link href="/forum">
            更多内容 <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <PillToggleRail className="mb-6 pb-2">
        {fallbackCategories.map((cat) => (
          <PillToggleButton
            key={cat.id}
            selected={activeCategory === cat.id}
            shrink
            onClick={() => setActiveCategory(cat.id)}
            className={cn(activeCategory === cat.id ? "" : "hover:bg-secondary/80 hover:text-foreground")}
          >
            {cat.label}
          </PillToggleButton>
        ))}
      </PillToggleRail>

      {loading ? (
        <StatePanel variant="outlined">
          加载中...
        </StatePanel>
      ) : filteredPosts.length === 0 ? (
        <StatePanel variant="outlined">
          当前分类暂无帖子
        </StatePanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              // 卡片 hover 只做轻边框和轻阴影，避免首页出现过强跳动感。
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {post.isHot && (
                  // 热门标签只给前两条，帮助用户更快锁定值得点开的帖子。
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 text-xs font-medium text-white">
                    <Flame className="h-3 w-3" />
                    热门
                  </div>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {post.avatar?.startsWith("http") || post.avatar?.startsWith("/") ? (
                    <img src={post.avatar} alt={post.author} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
                  ) : (
                    // 没有真实头像时回退 emoji 占位，避免作者位空掉。
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm text-lg">
                      {post.avatar || "👤"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">{post.author}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="mb-3 line-clamp-2 font-semibold text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                  <span className="text-xs">{post.timeAgo}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/forum">
            查看更多
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
