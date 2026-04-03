// app/page.tsx 是根路由 `/` 的入口文件。
// 这里刻意保持“超薄路由壳”，只负责把路由映射到真正的业务页面组件。
import { HomePage } from "@/src/features/home/page/home-page"

export default function Page() {
  // 首页的真实实现放在 feature 层，便于按业务组织组件、状态和接口代码。
  return <HomePage />
}
