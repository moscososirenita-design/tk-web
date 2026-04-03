"use client"

// 开奖历史数据 hook 负责拉取彩种 tab、历史列表和筛选状态，是历史页的数据中台。
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { historyAPI, type LotteryHistoryItem } from "@/src/features/history/api/history-api"
import { homeAPI } from "@/src/features/home/api/home-api"
import { normalizeTabs } from "@/src/features/home/mappers/home-mappers"
import type { SpecialLotteryTab } from "@/src/features/home/model/types"

interface HistoryState {
  loading: boolean
  error: string
  tabs: SpecialLotteryTab[]
  activeTabID: number
  orderMode: "asc" | "desc"
  showFive: boolean
  year: number
  items: LotteryHistoryItem[]
}

function defaultState(): HistoryState {
  // defaultState 单独抽函数，避免每次 render 都重新创建初始对象。
  return {
    loading: true,
    error: "",
    tabs: [],
    activeTabID: 0,
    orderMode: "desc",
    showFive: false,
    year: new Date().getFullYear(),
    items: []
  }
}

export function useHistoryData(preferredTabID = 0) {
  const [state, setState] = useState<HistoryState>(() => defaultState())
  const syncedPreferredTabIDRef = useRef(0)

  const loadTabs = useCallback(async () => {
    const overview = await homeAPI.getOverview()
    // 历史页的 tab 直接复用首页 overview 返回，减少重复接口。
    const tabs = normalizeTabs(overview.special_lotteries || [])
    const resolvedPreferredID =
      preferredTabID > 0 && tabs.some((tab) => tab.id === preferredTabID) ? preferredTabID : 0
    return {
      tabs,
      activeTabID: resolvedPreferredID || overview.active_tab_id || tabs[0]?.id || 0
    }
  }, [preferredTabID])

  const loadHistory = useCallback(
    async (tabID: number, orderMode: "asc" | "desc", showFive: boolean) => {
      if (tabID <= 0) {
        // 没有合法彩种 id 时直接回空列表，避免发出无效请求。
        return { year: new Date().getFullYear(), items: [] as LotteryHistoryItem[] }
      }
      const resp = await historyAPI.getDrawHistory(tabID, {
        limit: 80,
        order_mode: orderMode,
        show_five: showFive ? 1 : 0
      })
      return {
        year: resp.year || new Date().getFullYear(),
        items: resp.items || []
      }
    },
    []
  )

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      // 先拿 tabs，再按当前激活 tab 拉历史记录，保证请求链路清晰。
      const tabsPayload = await loadTabs()
      const historyPayload = await loadHistory(
        tabsPayload.activeTabID,
        state.orderMode,
        state.showFive
      )
      setState((prev) => ({
        ...prev,
        loading: false,
        tabs: tabsPayload.tabs,
        activeTabID: tabsPayload.activeTabID,
        year: historyPayload.year,
        items: historyPayload.items
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "历史开奖加载失败"
      }))
    }
  }, [loadHistory, loadTabs, state.orderMode, state.showFive])

  useEffect(() => {
    void load()
  }, [load])

  const selectTab = useCallback(
    async (tabID: number) => {
      // 切 tab 时只刷新历史列表，不重复请求整个 overview。
      setState((prev) => ({ ...prev, activeTabID: tabID, loading: true, error: "" }))
      try {
        const historyPayload = await loadHistory(tabID, state.orderMode, state.showFive)
        setState((prev) => ({
          ...prev,
          loading: false,
          year: historyPayload.year,
          items: historyPayload.items
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "历史开奖加载失败"
        }))
      }
    },
    [loadHistory, state.orderMode, state.showFive]
  )

  useEffect(() => {
    // 从首页热门彩种跳转进来时，如果 query 指定了 tabId，就同步切到对应彩种。
    if (
      preferredTabID > 0 &&
      preferredTabID !== syncedPreferredTabIDRef.current &&
      state.tabs.some((tab) => tab.id === preferredTabID)
    ) {
      syncedPreferredTabIDRef.current = preferredTabID
      void selectTab(preferredTabID)
    }
  }, [preferredTabID, selectTab, state.tabs])

  const toggleOrder = useCallback(() => {
    // 升序/降序切换只改状态，真正请求由上层 load effect 统一触发。
    setState((prev) => ({
      ...prev,
      orderMode: prev.orderMode === "desc" ? "asc" : "desc"
    }))
  }, [])

  const toggleShowFive = useCallback(() => {
    // showFive 控制是否把五行维度一并展示到页面标签里。
    setState((prev) => ({ ...prev, showFive: !prev.showFive }))
  }, [])

  // 历史页当前没有额外的本地二次筛选，因此 displayItems 暂时等于原始 items。
  // 这里保留 useMemo，是为了后续接筛选/搜索时不用再改返回结构。
  const displayItems = useMemo(() => state.items || [], [state.items])

  return {
    state,
    displayItems,
    reload: load,
    selectTab,
    toggleOrder,
    toggleShowFive
  }
}
