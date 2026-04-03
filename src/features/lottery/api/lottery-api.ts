import { http } from "@/src/shared/api/http"
import {
  normalizeLotteryDetailPayload,
  normalizeLotteryDrawDetailPayload,
  normalizeLotteryHistoryPayload,
} from "@/src/features/lottery/mappers/lottery-mappers"
import type {
  LotteryDetailResp,
  LotteryDrawDetailResp,
  LotteryDrawHistoryParams,
  LotteryHistoryResp,
  LotteryResultsResp,
} from "@/src/features/lottery/model/types"

async function getAndNormalizeHistory(path: string, params?: LotteryDrawHistoryParams): Promise<LotteryHistoryResp> {
  // 历史接口同时服务“彩种历史”和“图纸历史”，因此把公共请求逻辑抽到一个 helper。
  const payload = await http.get<LotteryHistoryResp>(
    path,
    // 只有在调用方真的带了分页/排序参数时才附加 query，避免空对象污染请求。
    params ? { params: params as Record<string, string | number | boolean | null | undefined> } : undefined
  )
  // 历史列表回包需要统一做字段兜底和数组标准化。
  return normalizeLotteryHistoryPayload(payload)
}

export const lotteryAPI = {
  getDrawHistory(specialLotteryID: number, params?: LotteryDrawHistoryParams): Promise<LotteryHistoryResp> {
    // 彩种历史：面向 history/draw-scene 这类“按彩种回看开奖记录”的页面。
    return getAndNormalizeHistory(`/public/business/special-lotteries/${specialLotteryID}/history`, params)
  },

  getHistory(lotteryInfoID: number): Promise<LotteryHistoryResp> {
    // 图纸历史：面向彩票详情页，拿到与当前图纸关联的往期开奖记录。
    return getAndNormalizeHistory(`/public/business/lottery-info/${lotteryInfoID}/history`)
  },

  async getDrawDetail(drawRecordID: number): Promise<LotteryDrawDetailResp> {
    // 开奖详情承载玩法 bundle，是前端读取特码/总分/七码统计等规则结果的主入口。
    const payload = await http.get<LotteryDrawDetailResp>(`/public/business/draw-records/${drawRecordID}/detail`)
    return normalizeLotteryDrawDetailPayload(payload)
  },

  async getDetail(lotteryInfoID: number): Promise<LotteryDetailResp> {
    // 图纸详情承载 banner、评论、推荐图纸、外链等“内容域”数据。
    const payload = await http.get<LotteryDetailResp>(`/public/business/lottery-info/${lotteryInfoID}/detail`)
    return normalizeLotteryDetailPayload(payload)
  },

  async getResults(lotteryInfoID: number): Promise<LotteryResultsResp> {
    // 结果接口承载“开奖结果域”数据；当前结构与 detail 一致，但语义上单独保留。
    const payload = await http.get<LotteryResultsResp>(`/public/business/lottery-info/${lotteryInfoID}/results`)
    return normalizeLotteryDetailPayload(payload)
  },
}
