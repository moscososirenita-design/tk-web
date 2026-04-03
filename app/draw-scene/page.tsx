// `/draw-scene` 路由入口文件。
// App Router 层只负责声明路由，不承载重业务逻辑。
// 真正的“开奖现场”实现继续放在 feature 目录，便于后续按业务维护。
// 这里额外套一层 Suspense，是为了兼容 feature 页面内部使用 useSearchParams。
// 否则 Next.js 在预渲染阶段会报 missing suspense boundary。
import { Suspense } from "react"
import { DrawScenePage } from "@/src/features/draw-scene/page/draw-scene-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DrawScenePage />
    </Suspense>
  )
}
