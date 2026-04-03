// 动态路由 `/forum/[id]` 的入口文件。
// 这里唯一的职责，是把路由参数解开后再交给真正的详情页面。
import { ForumDetailPage } from "@/src/features/forum/page/forum-detail-page"

interface ForumDetailRouteProps {
  // App Router 中 params 可能以 Promise 形式注入，这里显式声明出来方便维护者理解。
  params: Promise<{ id: string }>
}

export default async function Page({ params }: ForumDetailRouteProps) {
  // 先从路由参数里拿到帖子 id。
  const { id } = await params

  // 再把字符串形式的 id 转成业务页面更容易处理的数字类型。
  const postID = Number.parseInt(String(id), 10)

  // 详情页的渲染逻辑、接口调用和容错仍然放在 feature 层。
  return <ForumDetailPage postID={postID} />
}
