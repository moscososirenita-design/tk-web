import type { LotteryHistoryItem } from "@/src/features/history/api/history-api"
import type { DashboardData, SpecialLotteryTab } from "@/src/features/home/model/types"
import type { DisplayLotteryBallGroup } from "@/src/shared/utils/lottery-record"
import { sanitizeImageURL, sanitizeOutboundURL } from "@/src/shared/security/url"
import { buildDisplayLotteryBalls } from "@/src/shared/utils/lottery-record"

export interface DrawSceneDisplayItem extends LotteryHistoryItem {
  displayLabels: string[]
}

export interface DrawSceneSelection {
  selectedItem: DrawSceneDisplayItem | null
  selectedVideoURL: string
  sceneBalls: DisplayLotteryBallGroup
  videoItems: DrawSceneDisplayItem[]
}

export function resolveDrawSceneLabels(item: LotteryHistoryItem): string[] {
  // 开奖现场默认展示“生肖/五行”复合标签，优先走 pair_labels。
  const source = item.pair_labels || item.labels || []
  return source.map((entry) => {
    const raw = String(entry || "").trim()
    return raw || "-"
  })
}

export function normalizeDrawSceneHistoryItems(items: LotteryHistoryItem[]): DrawSceneDisplayItem[] {
  // 开奖现场会直接消费图片和视频 URL，因此统一在入口做安全清洗。
  return (items || []).map((item) => ({
    ...item,
    cover_image_url: sanitizeImageURL(item.cover_image_url) || "/placeholder.jpg",
    playback_url: sanitizeOutboundURL(item.playback_url),
    video_url: sanitizeOutboundURL(item.video_url),
    displayLabels: resolveDrawSceneLabels(item),
  }))
}

export function resolveDrawSceneVideoURL(item: LotteryHistoryItem | null, dashboard: DashboardData | null): string {
  if (!item) return ""

  // 优先播放历史回放；缺失时再退回兼容 video_url；
  // 如果刚好是当前期开奖，则最后再退回当前直播地址。
  return (
    item.playback_url ||
    item.video_url ||
    (item.issue === dashboard?.draw?.issue ? dashboard?.draw?.playback_url || dashboard?.live?.stream_url || "" : "") ||
    ""
  )
}

export function buildDrawSceneSelection(
  items: DrawSceneDisplayItem[],
  selectedIssue: string,
  dashboard: DashboardData | null
): DrawSceneSelection {
  // 当前选中期号失效时回退到第一条，保证播放器和摘要卡始终有展示内容。
  const selectedItem = items.find((item) => item.issue === selectedIssue) || items[0] || null
  const selectedVideoURL = resolveDrawSceneVideoURL(selectedItem, dashboard)
  const sceneBalls = selectedItem
    ? buildDisplayLotteryBalls(selectedItem.numbers, selectedItem.displayLabels, selectedItem.color_labels)
    : { normals: [], bonus: null }

  return {
    selectedItem,
    selectedVideoURL,
    sceneBalls,
    // 历史视频区只保留前 6 条，避免一进页面就被长列表压住主内容。
    videoItems: items.slice(0, 6),
  }
}

export function resolveDrawSceneTabRailClass(tabs: SpecialLotteryTab[]): string {
  // 彩种少时走平铺，多时再降级成横向滚动。
  if (tabs.length <= 1) return "grid grid-cols-1 gap-2"
  if (tabs.length === 2) return "grid grid-cols-2 gap-2"
  if (tabs.length === 3) return "grid grid-cols-3 gap-2"
  return "flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
}
