// `/history` 路由入口文件。
// 保持这种“薄包装”结构，是为了避免路由层和开奖历史业务强耦合。
import { Suspense } from "react"
import { HistoryPage } from "@/src/features/history/page/history-page"

export default function Page() {
  // 真正的页面实现继续由 feature 目录负责。
  // HistoryPage 里也使用了 useSearchParams，因此同样加 Suspense 包装。
  return (
    <Suspense fallback={null}>
      <HistoryPage />
    </Suspense>
  )
}
