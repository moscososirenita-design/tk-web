"use client"

// 论坛数据 hook 统一管理帖子列表、分类切换和关键词检索。
import { useCallback, useEffect, useState } from "react"
import { forumAPI } from "@/src/features/forum/api/forum-api"
import type { ForumCreateTopicPayload, ForumTabItem, ForumTopicItem } from "@/src/features/forum/model/types"
import { getAccessToken } from "@/src/shared/auth/storage"
import { safeKeyword } from "@/src/shared/security/validate"

interface ForumState {
  loading: boolean
  creating: boolean
  error: string
  keyword: string
  committedKeyword: string
  feed: string
  tabs: ForumTabItem[]
  years: number[]
  issues: string[]
  selectedYear: number
  selectedIssue: string
  items: ForumTopicItem[]
}

function initialState(): ForumState {
  // 默认 tabs 先给本地兜底，这样接口未返回 tabs 时页面也不会空白。
  return {
    loading: true,
    creating: false,
    error: "",
    keyword: "",
    committedKeyword: "",
    feed: "all",
    tabs: [
      { key: "all", label: "全部" },
      { key: "latest", label: "最新贴" },
      { key: "history", label: "历史贴" }
    ],
    years: [],
    issues: [],
    selectedYear: 0,
    selectedIssue: "",
    items: []
  }
}

export function useForumData() {
  const [state, setState] = useState<ForumState>(() => initialState())

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      const response = await forumAPI.topics({
        feed: state.feed,
        // committedKeyword 才是真正用于查询的值，避免用户一输入就打接口。
        keyword: safeKeyword(state.committedKeyword),
        limit: 30,
        year: state.feed === "history" && state.selectedYear > 0 ? state.selectedYear : undefined,
        issue: state.feed === "history" ? state.selectedIssue || undefined : undefined
      })

      setState((prev) => ({
        ...prev,
        loading: false,
        // 后端 tabs 缺失时沿用前端兜底 tabs，保证顶部切换栏稳定存在。
        tabs: response.tabs?.length ? response.tabs : prev.tabs,
        items: response.items || [],
        years: response.history_filters?.years || [],
        issues: response.history_filters?.issues || [],
        selectedYear:
          prev.feed === "history"
            ? prev.selectedYear || response.history_filters?.current_year || 0
            : prev.selectedYear,
        selectedIssue:
          prev.feed === "history"
            ? prev.selectedIssue || response.history_filters?.current_issue || ""
            : prev.selectedIssue
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "论坛数据加载失败"
      }))
    }
  }, [state.feed, state.committedKeyword, state.selectedIssue, state.selectedYear])

  useEffect(() => {
    // feed / committedKeyword / history 条件变化后自动重新拉列表。
    void load()
  }, [load])

  const setKeyword = useCallback((keyword: string) => {
    // 输入框本地值实时更新，但不立即触发搜索请求。
    setState((prev) => ({ ...prev, keyword: safeKeyword(keyword) }))
  }, [])

  const setFeed = useCallback((feed: string) => {
    setState((prev) => ({
      ...prev,
      feed,
      // 非历史模式时清空期号/年份筛选，避免旧筛选残留影响结果。
      selectedIssue: feed === "history" ? prev.selectedIssue : "",
      selectedYear: feed === "history" ? prev.selectedYear : 0
    }))
  }, [])

  const clearSearch = useCallback(() => {
    // 收起搜索框时同时清空本地输入和已提交条件，避免列表继续停留在空搜索结果。
    setState((prev) => ({ ...prev, keyword: "", committedKeyword: "" }))
  }, [])

  const setHistoryYear = useCallback((year: number) => {
    setState((prev) => ({ ...prev, selectedYear: year }))
  }, [])

  const setHistoryIssue = useCallback((issue: string) => {
    setState((prev) => ({ ...prev, selectedIssue: issue }))
  }, [])

  const submitSearch = useCallback(() => {
    // 真正提交搜索时才把 keyword 提升为 committedKeyword。
    setState((prev) => ({ ...prev, committedKeyword: prev.keyword }))
  }, [])

  const createTopic = useCallback(
    async (payload: ForumCreateTopicPayload) => {
      if (!getAccessToken()) {
        throw new Error("请先登录后再发帖")
      }
      setState((prev) => ({ ...prev, creating: true, error: "" }))
      try {
        const created = await forumAPI.createTopic(payload)
        await load()
        return created
      } catch (error) {
        const message = error instanceof Error ? error.message : "发帖失败"
        setState((prev) => ({ ...prev, error: message }))
        throw error
      } finally {
        setState((prev) => ({ ...prev, creating: false }))
      }
    },
    [load]
  )

  return {
    state,
    clearSearch,
    reload: load,
    submitSearch,
    setKeyword,
    setFeed,
    setHistoryYear,
    setHistoryIssue,
    createTopic
  }
}
