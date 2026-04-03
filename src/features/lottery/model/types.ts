import type {
  LotteryCommentItem,
  LotteryDetailBanner,
  LotteryDetailCurrentData,
  LotteryDetailData,
  LotteryDrawDetailData,
  LotteryExternalLinkItem,
  LotteryHistoryData,
  LotteryHistoryItem,
  LotteryIssueOption,
  LotteryPollOption,
  LotteryRecommendItem,
} from "@/src/shared/contracts/lottery"

export interface LotteryDrawHistoryParams {
  order_mode?: "asc" | "desc"
  show_five?: 0 | 1
  limit?: number
}

export type LotteryDetailResp = LotteryDetailData
export type LotteryResultsResp = LotteryDetailData
export type LotteryHistoryResp = LotteryHistoryData
export type LotteryDrawDetailResp = LotteryDrawDetailData

export type {
  LotteryCommentItem,
  LotteryDetailBanner,
  LotteryDetailCurrentData,
  LotteryDetailData,
  LotteryDrawDetailData,
  LotteryExternalLinkItem,
  LotteryHistoryData,
  LotteryHistoryItem,
  LotteryIssueOption,
  LotteryPollOption,
  LotteryRecommendItem,
}
