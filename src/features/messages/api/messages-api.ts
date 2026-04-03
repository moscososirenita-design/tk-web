import { http } from "@/src/shared/api/http"

export interface MessageSummaryResp {
  notice_unread: number
  interaction_unread: number
  private_unread: number
  total_unread: number
}

export interface SystemMessageItem {
  id: number
  title: string
  content: string
  message_type: string
  level: string
  biz_type: string
  biz_id: number
  sent_at: string
  is_read: boolean
}

export interface ConversationItem {
  conversation_key: string
  unread_count: number
  last_message_id: number
  last_message: string
  last_message_type: string
  last_sender_user_id: number
  last_message_at: string
  peer_user: {
    id: number
    username: string
    nickname: string
    avatar: string
    user_type: string
  }
}

export interface PrivateMessageItem {
  id: number
  sender_user_id: number
  receiver_user_id: number
  content: string
  message_type: string
  is_read: boolean
  read_at?: string | null
  created_at: string
  is_mine: boolean
}

export interface PrivateMessageListResp {
  conversation_key: string
  peer_user: {
    id: number
    username: string
    nickname: string
    avatar: string
    user_type: string
  }
  items: PrivateMessageItem[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const messagesAPI = {
  summary(): Promise<MessageSummaryResp> {
    return http.get<MessageSummaryResp>("/public/user/messages/summary")
  },

  systemList(params?: { limit?: number; offset?: number }): Promise<{ items: SystemMessageItem[]; total: number }> {
    return http.get<{ items: SystemMessageItem[]; total: number }>("/public/user/messages/system", { params })
  },

  conversations(params?: { limit?: number; offset?: number }): Promise<{ items: ConversationItem[]; total: number }> {
    return http.get<{ items: ConversationItem[]; total: number }>("/public/user/messages/conversations", { params })
  },

  privateList(params: { peer_user_id: number; limit?: number; offset?: number }): Promise<PrivateMessageListResp> {
    return http.get<PrivateMessageListResp>("/public/user/messages/private", { params })
  },

  sendPrivate(payload: { receiver_user_id: number; content: string }): Promise<{ message_id: number }> {
    return http.post<{ message_id: number }>("/public/user/messages/private/send", payload)
  },

  markPrivateRead(payload: { peer_user_id: number; up_to_message_id?: number }): Promise<{ marked_count: number }> {
    return http.post<{ marked_count: number }>("/public/user/messages/private/read", payload)
  },

  markAllSystemRead(): Promise<{ marked: boolean }> {
    return http.post<{ marked: boolean }>("/public/user/messages/system/read", { mark_all: true })
  }
}
