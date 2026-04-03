// 首页接口层：负责首页 overview、dashboard 与图纸列表等聚合请求。
import { http } from "@/src/shared/api/http"
import type { DashboardData, HomeOverviewResp, LotteryCardsResp } from "@/src/features/home/model/types"

export const homeAPI = {
  getOverview(): Promise<HomeOverviewResp> {
    // overview 是首页入口总接口，先拿它再决定后续首屏请求如何展开。
    return http.get<HomeOverviewResp>("/public/business/home")
  },

  getLotteryCards(category?: string): Promise<LotteryCardsResp> {
    // category 不传时由后端返回默认分类，对首页初次进入更友好。
    return http.get<LotteryCardsResp>("/public/business/lottery-cards", {
      params: category ? { category } : undefined
    })
  },

  getDashboard(specialLotteryID: number): Promise<DashboardData> {
    // dashboard 是开奖主舞台的重数据接口，按彩种单独请求可以减少首页串联刷新压力。
    return http.get<DashboardData>(`/public/business/special-lotteries/${specialLotteryID}/dashboard`)
  }
}
