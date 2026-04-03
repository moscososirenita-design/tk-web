import { http } from "@/src/shared/api/http"

export interface SocialUserItem {
  id: number
  username: string
  nickname: string
  display_name: string
  avatar: string
  user_type: string
  fans_count: number
  following_count: number
  growth_value: number
  level_no: number
  level_name: string
}

interface SocialListResp {
  user_id: number
  items: SocialUserItem[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export const profileSocialAPI = {
  followers(userID: number, params?: { limit?: number; offset?: number }): Promise<SocialListResp> {
    return http.get<SocialListResp>(`/public/user/users/${userID}/followers`, { params })
  },

  following(userID: number, params?: { limit?: number; offset?: number }): Promise<SocialListResp> {
    return http.get<SocialListResp>(`/public/user/users/${userID}/following`, { params })
  },
}
