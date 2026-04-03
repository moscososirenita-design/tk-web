"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User, MessageCircle, Trophy, Home, History } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "首页", href: "/", icon: Home },
  { label: "论坛", href: "/forum", icon: MessageCircle },
  { label: "高手推荐", href: "/experts", icon: Trophy },
  { label: "开奖历史", href: "/history", icon: History },
]

export function Header() {
  // 当前 pathname 用来判断哪个导航项需要高亮。
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <span className="text-xl font-bold text-primary-foreground">彩</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-xl font-black tracking-[0.04em] text-transparent">
              幸运彩票
            </h1>
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground/95">
              实时开奖 · 专业分析
            </p>
          </div>
        </Link>

        {/* 桌面导航把每个入口做成独立按钮，激活态与 hover 态都由当前主题色驱动。 */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              // 当前路由直接决定按钮的视觉状态，不额外维护一份导航激活 state。
              className={cn(
                "group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                pathname === item.href
                  ? "bg-secondary/85 text-foreground shadow-sm ring-1 ring-primary/20"
                  : "text-foreground/72 hover:bg-primary/10 hover:text-foreground hover:shadow-sm"
              )}
            >
              <item.icon
                className={cn(
                  // icon 与文本共用同一套激活逻辑，避免出现“字亮了但图标没亮”的割裂感。
                  "h-4 w-4 transition-colors",
                  pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span>{item.label}</span>
              {pathname === item.href ? (
                <span className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary/80 to-accent/80" />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* 右侧功能区：直播状态、主题切换、消息入口、论坛入口和登录入口。 */}
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-xs font-medium text-accent">直播中</span>
          </div>

          <ThemeSwitcher />

          {/* 消息入口固定放在主题切换后面，方便用户从任何页面快速看到未读状态。 */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/messages">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                3
              </span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
            <Link href="/forum">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* 登录按钮继续保留明显的主按钮样式，维持站点核心转化入口。 */}
          <Button className="hidden sm:flex gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
              登录
            </Link>
          </Button>

        </div>
      </div>
    </header>
  )
}
