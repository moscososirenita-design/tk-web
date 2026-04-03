// `/experts` 路由入口只负责装配高手推荐页组件。
// 这样 app 层永远只承担“声明路由”的职责，不把业务代码堆进来。
import { ExpertsPage } from "@/src/features/experts/page/experts-page"

export default function Page() {
  // 具体的筛选、榜单和布局逻辑都下沉到 feature 页面中维护。
  return <ExpertsPage />
}
