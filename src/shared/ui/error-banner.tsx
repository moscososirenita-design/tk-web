import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorBannerProps {
  children: ReactNode
  action?: ReactNode
  className?: string
  icon?: ReactNode
}

// ... existing code ...

/**
 * 错误提示横幅组件
 *
 * 用于显示错误信息，支持自定义图标和操作按钮
 *
 * @param children - 要显示的错误信息内容
 * @param action - 可选的操作按钮或元素，显示在横幅右侧
 * @param className - 可选的自定义 CSS 类名，用于额外样式定制
 * @param icon - 可选的自定义图标元素，默认为 AlertTriangle 警告图标
 * @returns 返回一个错误提示横幅组件
 */
export function ErrorBanner({ children, action, className, icon }: ErrorBannerProps) {
  return (
    <section className={cn("rounded-xl border border-destructive/35 bg-destructive/7 p-4 text-destructive", className)}>
      {/* 横幅容器，使用 flexbox 布局实现响应式排列 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 左侧区域：包含图标和错误信息文本 */}
        <div className="flex min-w-0 items-center gap-2">
          {/* 图标区域，使用自定义图标或默认警告图标 */}
          <span className="shrink-0">{icon ?? <AlertTriangle className="h-5 w-5" />}</span>
          {/* 错误文本内容区域，支持自动换行 */}
          <div className="min-w-0 text-sm leading-6">
            {children}
          </div>
        </div>
        {/* 右侧操作区域，仅在提供 action 时渲染 */}
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  )
}

