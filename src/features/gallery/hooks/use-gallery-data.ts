"use client"

import { useCallback, useEffect, useState } from "react"
import { homeAPI } from "@/src/features/home/api/home-api"
import { normalizeCards, normalizeCategories, normalizeHomeOverview } from "@/src/features/home/mappers/home-mappers"
import type { LotteryCardItem, LotteryCategoryItem } from "@/src/features/home/model/types"

interface GalleryState {
  // loading 控制整页骨架和分类按钮的忙碌态。
  loading: boolean
  // error 统一收口图纸板块请求失败文案。
  error: string
  // categories 提供顶部分类切换栏。
  categories: LotteryCategoryItem[]
  // currentCategory 记录当前激活的分类 key。
  currentCategory: string
  // cards 承载当前分类下的图纸卡片。
  cards: LotteryCardItem[]
}

function defaultState(): GalleryState {
  // 初始状态抽函数，后续如果要接刷新或重置可以直接复用。
  return {
    loading: true,
    error: "",
    categories: [{ key: "all", name: "全部", show_on_home: 1 }],
    currentCategory: "all",
    cards: [],
  }
}

export function useGalleryData(requestedCategory: string) {
  const [state, setState] = useState<GalleryState>(() => defaultState())

  const load = useCallback(
    async (nextCategory?: string) => {
      // 每次拉新分类前先清掉错误态。
      setState((prev) => ({ ...prev, loading: true, error: "" }))

      try {
        // 图纸板块沿用首页 overview 的分类定义，避免重复接口。
        const overview = normalizeHomeOverview(await homeAPI.getOverview())
        const categories = normalizeCategories(overview.lottery_categories || [])
        const currentCategory = nextCategory || requestedCategory || "all"
        const response = await homeAPI.getLotteryCards(currentCategory === "all" ? "" : currentCategory)
        const cards = normalizeCards(response.items || [])

        setState({
          loading: false,
          error: "",
          categories,
          currentCategory,
          cards,
        })
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "图纸板块加载失败",
        }))
      }
    },
    [requestedCategory]
  )

  useEffect(() => {
    // URL 分类变化后自动刷新对应卡片列表。
    void load(requestedCategory)
  }, [load, requestedCategory])

  return {
    state,
    reload: load,
  }
}
