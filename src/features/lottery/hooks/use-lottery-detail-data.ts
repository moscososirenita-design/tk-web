"use client"

import { useCallback, useEffect, useState } from "react"
import { lotteryAPI } from "@/src/features/lottery/api/lottery-api"
import { mergeLotteryDetailData } from "@/src/features/lottery/model/lottery-detail-view-model"
import type { LotteryDetailResp, LotteryDrawDetailResp, LotteryHistoryItem } from "@/src/features/lottery/model/types"

interface LotteryDetailState {
  // loading 控制整页骨架和按钮禁用状态。
  loading: boolean
  // error 统一承接本页所有接口失败文案。
  error: string
  // detail 是 detail/results 合并后的最终页面数据。
  detail: LotteryDetailResp | null
  // drawDetail 负责承接开奖规则 bundle。
  drawDetail: LotteryDrawDetailResp | null
  // history 负责承接同图纸关联的往期开奖列表。
  history: LotteryHistoryItem[]
}

function defaultState(): LotteryDetailState {
  // 初始状态抽函数，便于错误恢复或后续重置时直接复用。
  return {
    loading: true,
    error: "",
    detail: null,
    drawDetail: null,
    history: [],
  }
}

export function useLotteryDetailData(lotteryInfoID: number) {
  // 整个详情页的数据状态统一放在一个 hook 里，页面组件只负责渲染。
  const [state, setState] = useState<LotteryDetailState>(() => defaultState())

  const load = useCallback(async () => {
    // 非法路由参数直接终止，避免把无效 id 打到后台。
    if (!Number.isFinite(lotteryInfoID) || lotteryInfoID <= 0) {
      setState({
        loading: false,
        error: "图纸 ID 无效",
        detail: null,
        drawDetail: null,
        history: [],
      })
      return
    }

    // 每次重新拉取前先清空错误态，但保留旧数据到下一次 setState 覆盖。
    setState((prev) => ({ ...prev, loading: true, error: "" }))

    try {
      // 详情主接口必须成功；results/history 作为同域补充接口并行拉取。
      const [detail, results, historyResp] = await Promise.all([
        lotteryAPI.getDetail(lotteryInfoID),
        lotteryAPI.getResults(lotteryInfoID).catch(() => null),
        lotteryAPI.getHistory(lotteryInfoID).catch(() => ({
          lottery_info_id: lotteryInfoID,
          special_lottery_id: 0,
          special_lottery_name: "",
          title: "",
          year: new Date().getFullYear(),
          order_mode: "desc",
          show_five: true,
          items: [],
        })),
      ])

      // detail 负责图纸详情域，results 负责开奖结果域；这里统一合成页面最终消费的数据。
      const mergedDetail = mergeLotteryDetailData(detail, results)
      // drawRecordID 是后续进一步读取玩法 bundle 的唯一入口。
      const drawRecordID = Number(mergedDetail.current?.draw_record_id || 0)

      let drawDetail: LotteryDrawDetailResp | null = null
      if (drawRecordID > 0) {
        try {
          // 当前期玩法详情单独读取，避免 detail/results 负担过重。
          drawDetail = await lotteryAPI.getDrawDetail(drawRecordID)
        } catch {
          // 主详情优先展示；玩法详情失败时降级为空，不阻塞整页。
          drawDetail = null
        }
      }

      // 所有接口都完成后，再一次性落状态，减少页面闪烁。
      setState({
        loading: false,
        error: "",
        detail: mergedDetail,
        drawDetail,
        history: historyResp.items || [],
      })
    } catch (error) {
      // 主接口失败时，整页回到错误态，由页面层统一展示重试按钮。
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "彩票详情加载失败",
        detail: null,
        drawDetail: null,
        history: [],
      })
    }
  }, [lotteryInfoID])

  useEffect(() => {
    // 路由 id 变化后自动重拉，避免页面之间来回切换时残留旧数据。
    void load()
  }, [load])

  return {
    state,
    reload: load,
  }
}
