import type { LotteryHistoryItem } from "@/src/features/history/api/history-api"
import type { DisplayLotteryBallGroup } from "@/src/shared/utils/lottery-record"
import { buildDisplayLotteryBalls } from "@/src/shared/utils/lottery-record"

export interface HistoryDisplayItem extends LotteryHistoryItem {
  displayLabels: string[]
  balls: DisplayLotteryBallGroup
  sceneHref: string
}

export function resolveHistoryDisplayLabels(
  labels: string[],
  zodiacLabels: string[] | undefined,
  pairLabels: string[] | undefined,
  wuxingLabels: string[] | undefined,
  showFive: boolean
): string[] {
  // 优先使用后端显式拆出的生肖数组，缺失时再退回 pair_labels 或 labels。
  const sourceZodiac = (zodiacLabels && zodiacLabels.length > 0 ? zodiacLabels : pairLabels || labels || []).map(
    (item) => String(item || "").split("/")[0]
  )

  if (!showFive) return sourceZodiac

  // 五行模式下，把生肖和五行重新拼成“生肖/五行”复合标签。
  const sourceWuxing = (wuxingLabels && wuxingLabels.length > 0 ? wuxingLabels : pairLabels || labels || []).map(
    (item) => {
      const raw = String(item || "")
      return raw.includes("/") ? raw.split("/")[1] || "" : raw
    }
  )

  return sourceZodiac.map((zodiac, index) => {
    const wuxing = sourceWuxing[index] || ""
    return wuxing ? `${zodiac}/${wuxing}` : zodiac
  })
}

export function buildHistoryDisplayItems(
  items: LotteryHistoryItem[],
  showFive: boolean,
  activeTabID: number
): HistoryDisplayItem[] {
  // 历史页最终消费的是“已带标签和号码球”的展示对象，页面层不再做派生拼装。
  return (items || []).map((item) => {
    const displayLabels = resolveHistoryDisplayLabels(
      item.labels,
      item.zodiac_labels,
      item.pair_labels,
      item.wuxing_labels,
      showFive
    )

    return {
      ...item,
      displayLabels,
      balls: buildDisplayLotteryBalls(item.numbers, displayLabels, item.color_labels),
      sceneHref: `/draw-scene?tabId=${activeTabID}&issue=${encodeURIComponent(item.issue)}`,
    }
  })
}
