"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { homeAPI } from "@/src/features/home/api/home-api"
import type { BroadcastItem } from "@/src/features/home/model/types"
import { messagesAPI } from "@/src/features/messages/api/messages-api"
import { getAccessToken } from "@/src/shared/auth/storage"

export type MessageCategory = "notice" | "interaction" | "private"

// UserMessage 是页面层内部使用的消息视图模型。
export interface UserMessage {
  id: number
  title: string
  content: string
  category: MessageCategory
  createdAt: string
  peerUserID?: number
  conversationKey?: string
  unreadCount?: number
}

function classifyMessage(item: BroadcastItem): MessageCategory {
  const fullText = `${item.title || ""} ${item.content || ""}`.toLowerCase()
  if (/(评论|回复|点赞|互动|提到|关注|收藏)/.test(fullText)) {
    return "interaction"
  }
  if (/(私信|站内信|对话|聊天|会话)/.test(fullText)) {
    return "private"
  }
  return "notice"
}

interface MessagesState {
  loading: boolean
  error: string
  activeTab: MessageCategory
  items: UserMessage[]
  readIDs: number[]
}

function defaultState(): MessagesState {
  return {
    loading: true,
    error: "",
    activeTab: "notice",
    items: [],
    readIDs: [],
  }
}

function toCategoryByType(messageType: string): MessageCategory {
  if (messageType === "private_tip") return "private"
  if (messageType === "interaction") return "interaction"
  return "notice"
}

export function useMessagesData() {
  const [state, setState] = useState<MessagesState>(() => defaultState())

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))

    try {
      const token = getAccessToken()

      // 已登录用户优先走消息中心真实接口。
      if (token) {
        const [systemPayload, conversationPayload] = await Promise.all([
          messagesAPI.systemList({ limit: 60, offset: 0 }),
          messagesAPI.conversations({ limit: 60, offset: 0 }),
        ])

        const systemItems: UserMessage[] = (systemPayload.items || []).map((item) => ({
          id: item.id,
          title: item.title || "系统通知",
          content: item.content || "暂无内容",
          category: toCategoryByType(item.message_type),
          createdAt: item.sent_at,
        }))

        const privateItems: UserMessage[] = (conversationPayload.items || []).map((item, index) => {
          const peerName = item.peer_user?.nickname || item.peer_user?.username || "对方"
          // 私信会话和系统消息共用列表，ID 做一个大偏移避免碰撞。
          const localID = 1_000_000_000 + Number(item.last_message_id || index + 1)
          return {
            id: localID,
            title: `与${peerName}的私信`,
            content: item.last_message || "暂无内容",
            category: "private",
            createdAt: item.last_message_at,
            peerUserID: Number(item.peer_user?.id || 0),
            conversationKey: item.conversation_key,
            unreadCount: Number(item.unread_count || 0),
          }
        })

        const nextReadIDs = new Set<number>()
        for (const item of systemPayload.items || []) {
          if (item.is_read) nextReadIDs.add(item.id)
        }
        for (const [index, item] of (conversationPayload.items || []).entries()) {
          if ((item.unread_count || 0) <= 0) {
            nextReadIDs.add(1_000_000_000 + Number(item.last_message_id || index + 1))
          }
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: "",
          items: [...systemItems, ...privateItems].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
          readIDs: Array.from(nextReadIDs),
        }))
        return
      }

      // 未登录时回退到广播映射，保证页面仍可展示。
      const overview = await homeAPI.getOverview()
      const now = Date.now()
      const nextItems: UserMessage[] = (overview.broadcasts || []).map((item, index) => ({
        id: item.id,
        title: item.title || "系统通知",
        content: item.content || "暂无内容",
        category: classifyMessage(item),
        createdAt: new Date(now - index * 45 * 60 * 1000).toISOString(),
      }))

      setState((prev) => ({
        ...prev,
        loading: false,
        error: "",
        items: nextItems,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "消息加载失败",
      }))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const grouped = useMemo(() => {
    const initial: Record<MessageCategory, UserMessage[]> = {
      notice: [],
      interaction: [],
      private: [],
    }

    for (const item of state.items) {
      initial[item.category].push(item)
    }

    return initial
  }, [state.items])

  const currentItems = grouped[state.activeTab]
  const unreadCount = currentItems.filter((item) => !state.readIDs.includes(item.id)).length

  const setActiveTab = useCallback((tab: MessageCategory) => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }, [])

  const markAllRead = useCallback(async () => {
    if (currentItems.length === 0) return

    const token = getAccessToken()

    // 登录用户在通知/互动分栏下优先调用后端已读能力。
    if (token && state.activeTab !== "private") {
      try {
        await messagesAPI.markAllSystemRead()
        await load()
        return
      } catch {
        // 后端失败时回退本地已读，避免阻塞用户体验。
      }
    }

    // 私信分栏批量按会话标记已读。
    if (token && state.activeTab === "private") {
      try {
        const peerIDs = Array.from(new Set(currentItems.map((item) => Number(item.peerUserID || 0)).filter((id) => id > 0)))
        if (peerIDs.length > 0) {
          await Promise.all(
            peerIDs.map((peerUserID) =>
              messagesAPI.markPrivateRead({
                peer_user_id: peerUserID,
              })
            )
          )
          await load()
          return
        }
      } catch {
        // 后端失败时回退本地已读，避免阻塞用户体验。
      }
    }

    setState((prev) => ({
      ...prev,
      readIDs: Array.from(new Set([...prev.readIDs, ...currentItems.map((item) => item.id)])),
    }))
  }, [currentItems, load, state.activeTab])

  return {
    state,
    grouped,
    currentItems,
    unreadCount,
    reload: load,
    setActiveTab,
    markAllRead,
  }
}
