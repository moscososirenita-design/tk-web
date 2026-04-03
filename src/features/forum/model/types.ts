// ForumTopicUser 是论坛帖子作者与评论用户的公共用户结构。
export interface ForumTopicUser {
  id: number
  username: string
  nickname: string
  avatar: string
  user_type: string
}

// ForumTopicItem 对应论坛列表上的单条帖子摘要。
export interface ForumTopicItem {
  id: number
  user_id: number
  lottery_info_id: number
  title: string
  cover_image: string
  content_preview?: string
  is_official: boolean
  comment_count: number
  like_count: number
  issue?: string
  year?: number
  special_lottery_id?: number
  created_at: string
  user: ForumTopicUser
}

// ForumTabItem 对应论坛顶部 feed 切换项。
export interface ForumTabItem {
  key: "all" | "latest" | "history" | string
  label: string
}

// ForumTopicsResp 是论坛列表接口返回，顺带携带历史筛选条件。
export interface ForumTopicsResp {
  feed: string
  keyword: string
  issue?: string
  year?: number
  items: ForumTopicItem[]
  total: number
  tabs: ForumTabItem[]
  history_filters?: {
    years: number[]
    issues: string[]
    current_year: number
    current_issue: string
  }
}

// ForumDrawInfo 用于把帖子和某期开奖信息关联起来。
export interface ForumDrawInfo {
  id: number
  special_lottery_id: number
  issue: string
  year: number
  draw_at: string
  numbers: number[]
  labels: string[]
  playback_url: string
}

// ForumAuthorStats 承接作者维度的统计数据。
export interface ForumAuthorStats {
  post_count: number
  fans_count: number
  following_count: number
  growth_value: number
  read_post_count: number
  liked_count: number
}

// ForumAuthorInfo 是作者资料卡完整结构，在详情页中展示。
export interface ForumAuthorInfo extends ForumTopicUser {
  display_name: string
  stats: ForumAuthorStats
}

// ForumCommentItem 是评论列表最小展示单元。
export interface ForumCommentItem {
  id: number
  user_id: number
  parent_id?: number
  content: string
  likes: number
  reply_count?: number
  created_at: string
  user: ForumTopicUser
}

// ForumCommentReplyItem 是一级评论下的回复结构。
export interface ForumCommentReplyItem extends ForumCommentItem {}

// ForumPostCommentItem 是帖子评论列表中的一级评论结构。
export interface ForumPostCommentItem extends ForumCommentItem {
  replies: ForumCommentReplyItem[]
}

// ForumPostCommentsResp 是帖子评论分页接口返回。
export interface ForumPostCommentsResp {
  post_id: number
  items: ForumPostCommentItem[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

// ForumTopicDetailResp 聚合了帖子正文、作者资料、开奖信息和评论信息。
export interface ForumTopicDetailResp {
  topic: ForumTopicItem & { content: string }
  draw: ForumDrawInfo | null
  author: ForumAuthorInfo
  author_history: ForumTopicItem[]
  hot_comments: ForumCommentItem[]
  latest_comments: ForumCommentItem[]
  comment_total: number
}

// ForumCreateTopicPayload 发帖请求参数。
export interface ForumCreateTopicPayload {
  lottery_info_id?: number
  title: string
  content: string
  cover_image?: string
}

// ForumCreateTopicResp 发帖返回结果。
export interface ForumCreateTopicResp {
  post_id: number
  user_id: number
  title: string
  lottery_info_id: number
  is_official: boolean
  created_at: string
}

// ForumCreateCommentPayload 发表评论/回复请求参数。
export interface ForumCreateCommentPayload {
  parent_id?: number
  content: string
}

// ForumCreateCommentResp 评论创建返回结果。
export interface ForumCreateCommentResp {
  comment_id: number
  post_id: number
  parent_id: number
  user_id: number
  content: string
  created_at: string
  lottery_info_id: number
}

// ForumToggleLikeResp 点赞切换返回结果（帖子/评论共用）。
export interface ForumToggleLikeResp {
  liked: boolean
  like_count: number
  post_id?: number
  comment_id?: number
}

// UserFollowStateResp 当前用户对目标用户关注状态。
export interface UserFollowStateResp {
  target_user_id: number
  following: boolean
}

// UserFollowToggleResp 关注切换返回结果。
export interface UserFollowToggleResp extends UserFollowStateResp {
  my_following_count: number
  target_fans_count: number
}

// UserLevelResp 用户等级结构。
export interface UserLevelResp {
  user_id: number
  growth_value: number
  level_no: number
  level_name: string
  level_icon_url: string
  privileges: string[]
  next_level_no: number
  next_level_name: string
  next_need_growth: number
}
