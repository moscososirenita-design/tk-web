"use client"

// 统计横幅承担首页信任背书角色，向用户展示平台体量、速度和准确性等指标。
import { Users, BarChart3, Award, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  { icon: Users, value: "1,234,567", label: "注册用户", color: "text-primary" },
  { icon: BarChart3, value: "50,000+", label: "每日分析", color: "text-emerald-400" },
  { icon: Award, value: "98.5%", label: "数据准确", color: "text-amber-400" },
  { icon: Zap, value: "<1s", label: "更新速度", color: "text-rose-400" },
]

interface StatsBannerProps {
  className?: string
}

export function StatsBanner({ className }: StatsBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-transparent py-2 lg:rounded-2xl lg:border lg:border-border/50 lg:bg-gradient-to-r lg:from-primary/5 lg:via-card lg:to-accent/5 lg:p-5",
        className
      )}
    >
      {/* Background Elements */}
      <div className="absolute -left-10 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl lg:block" />
      <div className="absolute -right-10 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl lg:block" />

      <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-4 lg:gap-5">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {/* 图标容器保持统一底色，让不同颜色的图标本身成为视觉重点。 */}
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/50 lg:h-12 lg:w-12 lg:rounded-xl">
              <stat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.color}`} />
            </div>
            {/* value 用更强字号建立第一阅读层级，label 退回说明层。 */}
            <div className={`text-xl font-bold ${stat.color} lg:text-2xl`}>{stat.value}</div>
            <div className="text-xs leading-5 text-muted-foreground lg:text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
