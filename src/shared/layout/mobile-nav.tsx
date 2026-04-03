"use client"

import { usePathname } from "next/navigation"
import { Home, MessageSquare, Trophy, History, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "首页", href: "/" },
  { icon: MessageSquare, label: "论坛", href: "/forum" },
  { icon: History, label: "历史", href: "/history" },
  { icon: Trophy, label: "高手", href: "/experts" },
  { icon: User, label: "我的", href: "/profile" },
]

export function MobileNav() {
  // pathname 用于判断当前高亮的导航项，保证移动端切页时反馈明确。
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
      {/* iOS 安全区补偿，避免底部按钮被手势条遮挡。 */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  )
}
