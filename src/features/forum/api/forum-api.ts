// 论坛接口层：专门负责帖子列表、帖子详情等论坛业务请求。
import { http } from "@/src/shared/api/http"
import type {
  ForumCreateCommentPayload,
  ForumCreateCommentResp,
  ForumCreateTopicPayload,
  ForumCreateTopicResp,
  ForumPostCommentsResp,
  ForumToggleLikeResp,
  ForumTopicDetailResp,
  ForumTopicsResp,
  UserFollowStateResp,
  UserFollowToggleResp,
  UserLevelResp,
} from "@/src/features/forum/model/types"

export const forumAPI = {
  topics(params?: {
    feed?: string
    keyword?: string
    limit?: number
    issue?: string
    year?: number
  }): Promise<ForumTopicsResp> {
    // topics 承接论坛列表、搜索、期号筛选等多个场景，因此保留可选查询参数。
    return http.get<ForumTopicsResp>("/public/user/topics", { params })
  },

  topicDetail(postID: number): Promise<ForumTopicDetailResp> {
    // 详情接口按帖子 id 定位单篇内容，避免列表页把大文本全量带回来。
    return http.get<ForumTopicDetailResp>(`/public/user/topics/${postID}/detail`)
  },

  createTopic(payload: ForumCreateTopicPayload): Promise<ForumCreateTopicResp> {
    return http.post<ForumCreateTopicResp>("/public/user/topics", payload)
  },

  topicComments(postID: number, params?: { limit?: number; offset?: number; sort?: "latest" | "hot" | string }): Promise<ForumPostCommentsResp> {
    return http.get<ForumPostCommentsResp>(`/public/user/topics/${postID}/comments`, { params })
  },

  createComment(postID: number, payload: ForumCreateCommentPayload): Promise<ForumCreateCommentResp> {
    return http.post<ForumCreateCommentResp>(`/public/user/topics/${postID}/comments`, payload)
  },

  toggleTopicLike(postID: number): Promise<ForumToggleLikeResp> {
    return http.post<ForumToggleLikeResp>(`/public/user/topics/${postID}/likes/toggle`)
  },

  toggleCommentLike(commentID: number): Promise<ForumToggleLikeResp> {
    return http.post<ForumToggleLikeResp>(`/public/user/comments/${commentID}/likes/toggle`)
  },

  followToggle(targetUserID: number): Promise<UserFollowToggleResp> {
    return http.post<UserFollowToggleResp>("/public/user/follows/toggle", undefined, {
      params: { target_user_id: targetUserID },
    })
  },

  followState(targetUserID: number): Promise<UserFollowStateResp> {
    return http.get<UserFollowStateResp>("/public/user/follows/state", {
      params: { target_user_id: targetUserID },
    })
  },

  userLevel(userID: number): Promise<UserLevelResp> {
    return http.get<UserLevelResp>(`/public/user/users/${userID}/level`)
  },
}
