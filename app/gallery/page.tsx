// `/gallery` 路由入口文件。
// 图纸板块单独成页，承接首页“更多 / 查看更多 / 图库浏览”等跳转。
import { Suspense } from "react"
import { GalleryPage } from "@/src/features/gallery/page/gallery-page"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GalleryPage />
    </Suspense>
  )
}
