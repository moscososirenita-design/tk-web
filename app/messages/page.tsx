// `/messages` 路由入口文件。
// app 目录只挂路由，消息中心页面本身仍然放在 feature 模块里维护。
import { MessagesPage } from "@/src/features/messages/page/messages-page"

export default function Page() {
  // 这样页面逻辑迁移、复用和拆分时，路由层不需要跟着一起大改。
  return <MessagesPage />
}
