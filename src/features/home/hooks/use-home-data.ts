"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { expertsAPI } from "@/src/features/experts/api/experts-api"
import type { ExpertItem } from "@/src/features/experts/model/types"
import { homeAPI } from "@/src/features/home/api/home-api"
import {
  normalizeCards,
  normalizeCategories,
  normalizeDashboard,
  normalizeHomeOverview,
  normalizeTabs
} from "@/src/features/home/mappers/home-mappers"
import type {
  BannerItem,
  BroadcastItem,
  DashboardData,
  HomeOverviewResp,
  LotteryCardItem,
  LotteryCategoryItem,
  SpecialLotteryTab
} from "@/src/features/home/model/types"
import { safeKeyword } from "@/src/shared/security/validate"

// 首页的聚合状态全部由这个 hook 管理。
// 页面层只关心“拿到什么数据、用什么状态展示”，不直接碰接口拼装细节。
interface HomeDataState {
  loading: boolean
  error: string
  title: string
  tabs: SpecialLotteryTab[]
  activeTabID: number
  dashboard: DashboardData | null
  categories: LotteryCategoryItem[]
  currentCategory: string
  cards: LotteryCardItem[]
  banners: BannerItem[]
  broadcasts: BroadcastItem[]
  experts: ExpertItem[]
  showStatsBanner: boolean
}

function emptyState(): HomeDataState {
  // 集中声明默认值，避免默认状态散落在组件各处不好维护。
  return {
    loading: true,
    error: "",
    title: "TK Web",
    tabs: [],
    activeTabID: 0,
    dashboard: null,
    categories: [{ key: "all", name: "全部", show_on_home: 1 }],
    currentCategory: "all",
    cards: [],
    banners: [],
    broadcasts: [],
    experts: [],
    showStatsBanner: true
  }
}

function mergeBanners(overview: HomeOverviewResp): BannerItem[] {
  // 后台把官方 banner 与广告 banner 分开发，这里在首页入口层把它们合并起来。
  const official = overview.banners?.official || []
  const ad = overview.banners?.ad || []
  return [...official, ...ad]
}

function resolveShowStatsBanner(overview: HomeOverviewResp): boolean {
  // 不同版本接口里这个开关出现过多个位置，这里统一做兼容读取。
  const value = [
    overview.feature_flags?.show_stats_banner,
    overview.home_blocks?.show_stats_banner,
    overview.show_stats_banner
  ].find((item) => typeof item === "boolean")

  return typeof value === "boolean" ? value : true
}

export function useHomeData() {
  const [state, setState] = useState<HomeDataState>(() => emptyState())

  const loadDashboard = useCallback(async (tabID: number) => {
    // 开奖直播区对应的数据量较大，因此单独拆成一个方法，方便在切换彩种时按需刷新。
    const dashboard = await homeAPI.getDashboard(tabID)
    return normalizeDashboard(dashboard)
  }, [])

  const loadCards = useCallback(async (category: string) => {
    // 分类关键字先做安全过滤，避免把脏值直接带进接口查询参数里。
    const selected = category === "all" ? "" : safeKeyword(category)
    const response = await homeAPI.getLotteryCards(selected)
    return normalizeCards(response.items || [])
  }, [])

  const load = useCallback(
    async (nextCategory?: string) => {
      // 整页刷新前先进入 loading，并清掉旧错误，保证 UI 状态与真实请求过程一致。
      setState((prev) => ({ ...prev, loading: true, error: "" }))
      try {
        // overview 是首页主入口接口，先把全局基础数据拉下来。
        const overview = normalizeHomeOverview(await homeAPI.getOverview())
        const tabs = normalizeTabs(overview.special_lotteries || [])
        // 后台没有明确活动 tab 时，默认退回第一项，避免首页首屏失去主彩种。
        const activeTabID = overview.active_tab_id || tabs[0]?.id || 0
        const categories = normalizeCategories(overview.lottery_categories || [])
        const currentCategory = nextCategory || "all"

        // 首屏关键资源并行拉取，减少不必要的串行等待。
        const [dashboard, cardsResp, expertsResp] = await Promise.all([
          activeTabID > 0 ? loadDashboard(activeTabID) : Promise.resolve(null),
          loadCards(currentCategory),
          expertsAPI.boards({ limit: 12, lottery_code: tabs[0]?.code || undefined })
        ])

        setState((prev) => ({
          ...prev,
          loading: false,
          // title 后续可以直接用于 document.title 或 SEO 元信息同步。
          title: overview.title || "TK Web",
          tabs,
          activeTabID,
          dashboard,
          categories,
          currentCategory,
          cards: cardsResp,
          banners: mergeBanners(overview),
          broadcasts: overview.broadcasts || [],
          experts: (expertsResp.groups || []).flatMap((group) => group.items || []),
          showStatsBanner: resolveShowStatsBanner(overview)
        }))
      } catch (error) {
        // 所有异常统一折叠为可读错误文案，不把原始异常直接暴露到界面。
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "首页数据加载失败"
        }))
      }
    },
    [loadCards, loadDashboard]
  )

  const selectTab = useCallback(
    async (tabID: number) => {
      // 切换彩种只刷新开奖面板，不重新拉整页，避免造成首页大闪烁。
      if (tabID <= 0) return
      // 切换时保留上一张卡片，等新数据回来再整体替换，避免 H5 上出现明显闪屏。
      setState((prev) => ({ ...prev, activeTabID: tabID, error: "" }))
      try {
        const dashboard = await loadDashboard(tabID)
        // tab 切换只替换 dashboard，其它模块状态保持不变，减少用户感知抖动。
        setState((prev) => ({ ...prev, dashboard }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "开奖面板加载失败"
        }))
      }
    },
    [loadDashboard]
  )

  const selectCategory = useCallback(
    async (category: string) => {
      // 图纸分类切换只重拉图纸列表，控制请求范围，避免拖慢首页其他模块。
      setState((prev) => ({ ...prev, currentCategory: category }))
      try {
        const cards = await loadCards(category)
        // 图纸卡片是独立数据块，因此只局部替换 cards，不干扰其它内容。
        setState((prev) => ({ ...prev, cards }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "图纸列表加载失败"
        }))
      }
    },
    [loadCards]
  )

  useEffect(() => {
    // 首次进入首页时自动触发完整加载流程。
    void load()
  }, [load])

  const activeTab = useMemo(
    // 当前彩种会被多个首页组件复用，这里提前 memo 避免重复查找。
    () => state.tabs.find((item) => item.id === state.activeTabID) || null,
    [state.tabs, state.activeTabID]
  )

  // 页面层只暴露需要消费的状态和操作函数，不把内部拆分逻辑泄漏出去。
  return {
    state,
    activeTab,
    reload: load,
    selectTab,
    selectCategory
  }
}
