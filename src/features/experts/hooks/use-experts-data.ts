"use client"

// 高手页数据 hook 负责拉取高手榜单，并把筛选后的结果整理成页面更易消费的状态。
import { useCallback, useEffect, useState } from "react"
import { expertsAPI } from "@/src/features/experts/api/experts-api"
import type { ExpertGroup } from "@/src/features/experts/model/types"
import { safeKeyword } from "@/src/shared/security/validate"

interface ExpertsState {
  loading: boolean
  error: string
  lotteryCode: string
  total: number
  groups: ExpertGroup[]
}

export function useExpertsData() {
  const [state, setState] = useState<ExpertsState>({
    loading: true,
    error: "",
    lotteryCode: "",
    total: 0,
    groups: []
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      const resp = await expertsAPI.boards({
        limit: 12,
        // 彩种关键字统一清洗后再带给接口，避免无效字符造成查询波动。
        lottery_code: safeKeyword(state.lotteryCode) || undefined
      })
      setState((prev) => ({
        ...prev,
        loading: false,
        total: resp.total || 0,
        groups: resp.groups || []
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "高手榜单加载失败"
      }))
    }
  }, [state.lotteryCode])

  useEffect(() => {
    // 首次进入高手页以及彩种切换后都自动刷新榜单。
    void load()
  }, [load])

  const setLotteryCode = useCallback((code: string) => {
    // 仅更新筛选值，不在这里直接请求；请求交给上面的 load effect 统一触发。
    setState((prev) => ({ ...prev, lotteryCode: safeKeyword(code) }))
  }, [])

  return {
    state,
    reload: load,
    setLotteryCode
  }
}
