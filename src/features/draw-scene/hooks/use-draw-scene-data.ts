"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { historyAPI } from "@/src/features/history/api/history-api"
import { homeAPI } from "@/src/features/home/api/home-api"
import { normalizeDashboard, normalizeTabs } from "@/src/features/home/mappers/home-mappers"
import type { DashboardData, SpecialLotteryTab } from "@/src/features/home/model/types"
import {
  buildDrawSceneSelection,
  normalizeDrawSceneHistoryItems,
  type DrawSceneDisplayItem,
} from "@/src/features/draw-scene/model/draw-scene-view-model"

interface DrawSceneState {
  // loading 控制整页骨架与摘要卡占位。
  loading: boolean
  // error 统一承接本页所有请求异常。
  error: string
  // tabs 提供顶部彩种切换数据。
  tabs: SpecialLotteryTab[]
  // activeTabID 表示当前正在查看哪一个彩种。
  activeTabID: number
  // dashboard 提供当前期开奖摘要与下期开奖时间。
  dashboard: DashboardData | null
  // items 承载当前彩种下的往期开奖记录。
  items: DrawSceneDisplayItem[]
  // selectedIssue 决定摘要卡和播放器当前展示哪一期。
  selectedIssue: string
}

function defaultState(): DrawSceneState {
  // 初始状态抽成函数，便于未来重置或错误恢复时直接复用。
  return {
    loading: true,
    error: "",
    tabs: [],
    activeTabID: 0,
    dashboard: null,
    items: [],
    selectedIssue: "",
  }
}

export function useDrawSceneData(requestedTabID: number, requestedIssue: string) {
  const [state, setState] = useState<DrawSceneState>(() => defaultState())

  const load = useCallback(async () => {
    // 每次重载前先清空错误态，避免旧错误残留。
    setState((prev) => ({ ...prev, loading: true, error: "" }))

    try {
      // overview 提供彩种 tabs；dashboard 提供当前期开奖摘要；history 提供往期列表。
      const overview = await homeAPI.getOverview()
      const tabs = normalizeTabs(overview.special_lotteries || [])
      const resolvedTabID =
        requestedTabID > 0 && tabs.some((tab) => tab.id === requestedTabID)
          ? requestedTabID
          : overview.active_tab_id || tabs[0]?.id || 0

      const [historyResp, dashboardResp] = await Promise.all([
        historyAPI.getDrawHistory(resolvedTabID, { limit: 12, order_mode: "desc", show_five: 1 }),
        resolvedTabID > 0 ? homeAPI.getDashboard(resolvedTabID) : Promise.resolve(null),
      ])

      const dashboard = normalizeDashboard(dashboardResp)
      const items = normalizeDrawSceneHistoryItems(historyResp.items || [])
      // 默认期号优先级：URL 指定 > 当前期开奖 > 历史第一条。
      const resolvedIssue =
        (requestedIssue && items.some((item) => item.issue === requestedIssue) ? requestedIssue : "") ||
        dashboard?.draw?.issue ||
        items[0]?.issue ||
        ""

      setState({
        loading: false,
        error: "",
        tabs,
        activeTabID: resolvedTabID,
        dashboard,
        items,
        selectedIssue: resolvedIssue,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "开奖现场加载失败",
      }))
    }
  }, [requestedIssue, requestedTabID])

  useEffect(() => {
    // 彩种参数变化后整页重拉，因为摘要卡和历史回放都会跟着变化。
    void load()
  }, [load])

  useEffect(() => {
    // issue 查询参数变化时，只同步本地选中期号，不重新拉整个页面。
    if (
      requestedIssue &&
      requestedIssue !== state.selectedIssue &&
      state.items.some((item) => item.issue === requestedIssue)
    ) {
      setState((prev) => ({ ...prev, selectedIssue: requestedIssue }))
    }
  }, [requestedIssue, state.items, state.selectedIssue])

  const selection = useMemo(
    // 当前期号、主播放器和球体展示都统一在 view helper 中派生。
    () => buildDrawSceneSelection(state.items, state.selectedIssue, state.dashboard),
    [state.dashboard, state.items, state.selectedIssue]
  )

  const selectIssue = useCallback((issue: string) => {
    // 点击历史回放卡片时立即本地切中，保证交互响应足够快。
    setState((prev) => ({ ...prev, selectedIssue: issue }))
  }, [])

  return {
    state,
    selection,
    reload: load,
    selectIssue,
  }
}
