// 历史接口层：保留历史页语义，底层实现统一委托给 lottery feature API。
import { lotteryAPI } from "@/src/features/lottery/api/lottery-api"
import type {
  LotteryDrawDetailResp,
  LotteryDrawHistoryParams,
  LotteryHistoryItem,
  LotteryHistoryResp,
} from "@/src/features/lottery/model/types"

export const historyAPI = {
  getDrawHistory(
    specialLotteryID: number,
    params?: LotteryDrawHistoryParams
  ): Promise<LotteryHistoryResp> {
    return lotteryAPI.getDrawHistory(specialLotteryID, params)
  },

  getDrawDetail(drawRecordID: number): Promise<LotteryDrawDetailResp> {
    return lotteryAPI.getDrawDetail(drawRecordID)
  }
}

export type { LotteryDrawDetailResp as LotteryDrawDetailData, LotteryHistoryItem, LotteryHistoryResp }
