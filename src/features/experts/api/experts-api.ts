// 高手接口层：统一管理高手榜单和相关数据入口，避免页面自己拼接 URL。
import { http } from "@/src/shared/api/http"
import type { ExpertBoardsResp } from "@/src/features/experts/model/types"

export const expertsAPI = {
  boards(params?: { limit?: number; lottery_code?: string }): Promise<ExpertBoardsResp> {
    // params 允许按彩种和数量过滤，高手页与首页榜单都复用这一入口。
    return http.get<ExpertBoardsResp>("/public/user/expert-boards", { params })
  }
}
