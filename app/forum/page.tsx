// `/forum` 路由入口。
// 路由层和业务层分离后，目录职责会清楚很多：app 管路由，src/features 管业务。
import { ForumPage } from "@/src/features/forum/page/forum-page"

export default function Page() {
  // 论坛列表页本体放在 feature 层，后续继续拆论坛模块时不会牵动 app 层。
  return <ForumPage />
}
