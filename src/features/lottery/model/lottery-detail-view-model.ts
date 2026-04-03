import type {
  LotteryCommentItem,
  LotteryDetailData,
  LotteryDrawDetailData,
  LotteryHistoryItem,
  LotteryResultsResp,
} from "@/src/features/lottery/model/types"
import type { DisplayLotteryBallGroup } from "@/src/shared/utils/lottery-record"
import { buildDisplayLotteryBalls } from "@/src/shared/utils/lottery-record"

// 评论 tab key 单独抽类型，避免页面层和 helper 层各自手写一份字符串联合类型。
export type CommentTabKey = "system" | "user" | "hot" | "latest"

// 开奖球永远拆成“普通号 + 特别号”两段，页面层不用再自己 slice。
export type LotteryDetailBallGroups = DisplayLotteryBallGroup

// 评论区切换按钮与评论列表共用同一份分组结构。
export interface LotteryDetailCommentGroup {
  key: CommentTabKey
  label: string
  items: LotteryCommentItem[]
}

// 详情页头部需要的派生数据统一收口在这里，减少组件里字符串拼装。
export interface LotteryDetailMeta {
  issueText: string
  drawAtText: string
  playbackURL: string
  historyHref: string
  sceneHref: string
}

// 关联开奖记录列表会额外附带一份适合前端直接展示的标签数组。
export interface LotteryHistoryPreviewItem extends LotteryHistoryItem {
  previewLabels: string[]
}

export function buildDetailBalls(numbers: number[], labels: string[], colorLabels: string[]): LotteryDetailBallGroups {
  // 详情页也复用共享球体整理逻辑，保证历史/现场/详情三处行为一致。
  return buildDisplayLotteryBalls(numbers, labels, colorLabels)
}

export function buildCommentGroups(detail: LotteryDetailData | null): LotteryDetailCommentGroup[] {
  // 评论分组统一在这里生成，页面层只需要切换 active key。
  return [
    { key: "system", label: "官方评论", items: detail?.system_comments || [] },
    { key: "user", label: "网友评论", items: detail?.user_comments || [] },
    { key: "hot", label: "热门评论", items: detail?.hot_comments || [] },
    { key: "latest", label: "最新评论", items: detail?.latest_comments || [] },
  ]
}

export function buildLotteryDetailMeta(
  detail: LotteryDetailData | null,
  drawDetail: LotteryDrawDetailData | null
): LotteryDetailMeta {
  // 当前期号优先取开奖期号，缺失时再退回图纸自己的 issue。
  const current = detail?.current
  const issueText = current?.draw_issue || current?.issue || ""
  // 开奖时间优先取 draw detail，因为它比 detail.current 更接近真实开奖记录。
  const drawAtText = drawDetail?.draw_at || ""
  // 回放地址允许从 current 和 draw detail 双侧兜底。
  const playbackURL = current?.playback_url || drawDetail?.playback_url || ""
  // 历史页是按彩种进入，所以这里只需要 special_lottery_id。
  const historyHref = current?.special_lottery_id ? `/history?tabId=${current.special_lottery_id}` : "/history"
  // 开奖现场是按彩种 + 期号双维度定位，所以这里直接把 issue 也拼进 URL。
  const sceneHref =
    current?.special_lottery_id && issueText
      ? `/draw-scene?tabId=${current.special_lottery_id}&issue=${encodeURIComponent(issueText)}`
      : "/draw-scene"

  return {
    issueText,
    drawAtText,
    playbackURL,
    historyHref,
    sceneHref,
  }
}

function preferArray<T>(primary: T[] | undefined, fallback: T[] | undefined): T[] {
  // 数组字段优先取当前响应里真正有内容的一侧，避免“空数组把有值数组覆盖掉”。
  return primary && primary.length > 0 ? primary : fallback || []
}

export function mergeLotteryDetailData(
  detail: LotteryDetailData,
  results: LotteryResultsResp | null
): LotteryDetailData {
  // results 接口后续如果继续细化，会优先承载“期开奖结果域”的当前期和期号列表。
  if (!results) return detail

  return {
    // current/years/issues/poll 这类结果域字段优先用 results。
    current: results.current?.id > 0 ? results.current : detail.current,
    years: preferArray(results.years, detail.years),
    issues: preferArray(results.issues, detail.issues),
    poll_options: preferArray(results.poll_options, detail.poll_options),
    poll_enabled: results.poll_enabled || detail.poll_enabled,
    poll_default_open: results.poll_default_open || detail.poll_default_open,
    show_metrics: results.show_metrics || detail.show_metrics,
    // banner/推荐/评论更偏内容域，所以优先保留 detail 的返回。
    detail_banners: preferArray(detail.detail_banners, results.detail_banners),
    recommend_items: preferArray(detail.recommend_items, results.recommend_items),
    external_links: preferArray(detail.external_links, results.external_links),
    system_comments: preferArray(detail.system_comments, results.system_comments),
    user_comments: preferArray(detail.user_comments, results.user_comments),
    hot_comments: preferArray(detail.hot_comments, results.hot_comments),
    latest_comments: preferArray(detail.latest_comments, results.latest_comments),
  }
}

export function resolveHistoryPreviewLabels(item: LotteryHistoryItem): string[] {
  // 详情页里的关联开奖记录默认直接展示“生肖/五行”复合标签。
  return (item.pair_labels && item.pair_labels.length > 0 ? item.pair_labels : item.labels || []).map((entry) => {
    const raw = String(entry || "").trim()
    return raw || "-"
  })
}

export function buildHistoryPreviewItems(
  items: LotteryHistoryItem[],
  currentDrawRecordID: number,
  limit = 6
): LotteryHistoryPreviewItem[] {
  // 当前图纸已展示过的同期开奖不再重复展示到“关联开奖记录”里。
  return (items || [])
    // 当前这期已经在主摘要卡展示过，这里只保留“相关往期”。
    .filter((item) => item.id !== currentDrawRecordID)
    // 详情页只保留一个短列表，避免把页面拉得过长。
    .slice(0, Math.max(0, limit))
    .map((item) => ({
      ...item,
      previewLabels: resolveHistoryPreviewLabels(item),
    }))
}
