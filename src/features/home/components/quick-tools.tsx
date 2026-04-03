"use client"

// 快捷工具区集中承接首页常用入口，避免把高频跳转分散在各个业务卡片中。
import Link from "next/link"
import { 
  BarChart3, 
  FileText, 
  Search, 
  Calculator, 
  BookOpen, 
  MessageSquare, 
  Wrench, 
  ShoppingBag,
  Sparkles,
  Brain
} from "lucide-react"
import { cn } from "@/lib/utils"

const tools = [
  { icon: BarChart3, label: "开奖结果", color: "from-blue-500 to-cyan-500", hot: false, href: "/history" },
  { icon: FileText, label: "资料大全", color: "from-emerald-500 to-teal-500", hot: false, href: "/forum" },
  { icon: Search, label: "资讯统计", color: "from-violet-500 to-purple-500", hot: false, href: "/history" },
  { icon: Calculator, label: "查询助手", color: "from-amber-500 to-orange-500", hot: false, href: "/history" },
  { icon: Brain, label: "AI预测", color: "from-rose-500 to-pink-500", hot: true, href: "/experts" },
  { icon: Sparkles, label: "幽默猜测", color: "from-indigo-500 to-blue-500", hot: false, href: "/forum" },
  { icon: BookOpen, label: "图库浏览", color: "from-teal-500 to-green-500", hot: false, href: "/gallery" },
  { icon: MessageSquare, label: "六合论坛", color: "from-pink-500 to-rose-500", hot: true, href: "/forum" },
  { icon: Wrench, label: "工具宝箱", color: "from-slate-500 to-gray-500", hot: false, href: "/profile" },
  { icon: ShoppingBag, label: "淘料市场", color: "from-orange-500 to-red-500", hot: false, href: "/forum" },
]

interface QuickToolsProps {
  className?: string
}

export function QuickTools({ className }: QuickToolsProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-transparent p-0 lg:flex lg:h-full lg:flex-col lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card lg:p-5",
        className
      )}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3 lg:mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 lg:h-10 lg:w-10 lg:rounded-xl">
          <Wrench className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold leading-6 text-foreground lg:text-lg">快捷工具</h2>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-5 gap-x-2 gap-y-5 sm:grid-cols-5 md:gap-4 lg:flex-1 lg:content-start lg:gap-x-5 lg:gap-y-6">
        {tools.map((tool, index) => (
          <Link
            key={index}
            href={tool.href}
            // 整个卡片都可点击，让“图标 + 文案 + HOT 标识”形成一个统一热区。
            className="group relative flex flex-col items-center gap-2 rounded-none border-0 bg-transparent p-1 transition-all duration-300 lg:rounded-xl lg:border lg:border-transparent lg:p-3 lg:hover:border-border/50 lg:hover:bg-secondary/50"
          >
            <div
              className={cn(
                // 每个工具都用独立渐变色，帮助用户快速区分不同入口。
                "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-none transition-transform duration-300 lg:h-12 lg:w-12 lg:rounded-xl lg:shadow-lg lg:group-hover:scale-110",
                tool.color
              )}
            >
              <tool.icon className="h-5 w-5 text-white lg:h-6 lg:w-6" />
            </div>
            <span className="text-center text-[11px] font-medium leading-[1.35] text-muted-foreground transition-colors lg:text-xs lg:group-hover:text-foreground">
              {tool.label}
            </span>
            {tool.hot && (
              // HOT 只标高价值入口，减少首页过多强调点造成的噪声。
              <span className="absolute right-1 top-0 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground lg:-right-1 lg:-top-1 lg:text-[10px]">
                HOT
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
