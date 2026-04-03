// `/profile` 路由入口文件。
// 路由文件越薄，后续查问题时越容易快速分清“是路由问题还是业务问题”。
import { ProfilePage } from "@/src/features/profile/page/profile-page"

export default function Page() {
  // 个人中心页面主体放在 feature 层，便于按用户业务持续扩展。
  return <ProfilePage />
}
