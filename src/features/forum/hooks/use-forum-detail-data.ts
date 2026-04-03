"use client"

import { useCallback, useEffect, useState } from "react"
import { forumAPI } from "@/src/features/forum/api/forum-api"
import type {
  ForumCreateCommentResp,
  ForumPostCommentItem,
  ForumToggleLikeResp,
  ForumTopicDetailResp,
  UserFollowToggleResp,
  UserLevelResp,
} from "@/src/features/forum/model/types"
import { getAccessToken } from "@/src/shared/auth/storage"

interface ForumDetailState {
  loading: boolean
  error: string
  detail: ForumTopicDetailResp | null
  commentsLoading: boolean
  commentsError: string
  comments: ForumPostCommentItem[]
  commentsTotal: number
  commentsHasMore: boolean
  commentsNextOffset: number
  submittingComment: boolean
  togglingPostLike: boolean
  togglingCommentID: number
  togglingFollow: boolean
  following: boolean
  level: UserLevelResp | null
}

function defaultState(): ForumDetailState {
  return {
    loading: true,
    error: "",
    detail: null,
    commentsLoading: true,
    commentsError: "",
    comments: [],
    commentsTotal: 0,
    commentsHasMore: false,
    commentsNextOffset: 0,
    submittingComment: false,
    togglingPostLike: false,
    togglingCommentID: 0,
    togglingFollow: false,
    following: false,
    level: null,
  }
}

export function useForumDetailData(postID: number) {
  const [state, setState] = useState<ForumDetailState>(() => defaultState())

  const loadAuthorMeta = useCallback(async (authorUserID: number) => {
    if (!Number.isFinite(authorUserID) || authorUserID <= 0) {
      setState((prev) => ({ ...prev, level: null, following: false }))
      return
    }

    try {
      const level = await forumAPI.userLevel(authorUserID)
      setState((prev) => ({ ...prev, level }))
    } catch {
      setState((prev) => ({ ...prev, level: null }))
    }

    if (!getAccessToken()) {
      setState((prev) => ({ ...prev, following: false }))
      return
    }

    try {
      const followState = await forumAPI.followState(authorUserID)
      setState((prev) => ({ ...prev, following: Boolean(followState.following) }))
    } catch {
      setState((prev) => ({ ...prev, following: false }))
    }
  }, [])

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(postID) || postID <= 0) {
      setState((prev) => ({ ...prev, loading: false, error: "帖子 ID 无效", detail: null }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: "" }))

    try {
      const detail = await forumAPI.topicDetail(postID)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "",
        detail,
      }))
      await loadAuthorMeta(Number(detail.author?.id || detail.topic?.user_id || 0))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "帖子详情加载失败",
        detail: null,
      }))
    }
  }, [loadAuthorMeta, postID])

  const loadComments = useCallback(
    async (reset = false, offsetOverride?: number) => {
      if (!Number.isFinite(postID) || postID <= 0) {
        setState((prev) => ({ ...prev, commentsLoading: false, commentsError: "帖子 ID 无效" }))
        return
      }

      const offset = reset ? 0 : Math.max(0, Number(offsetOverride || 0))
      setState((prev) => ({ ...prev, commentsLoading: true, commentsError: "" }))

      try {
        const payload = await forumAPI.topicComments(postID, {
          limit: 20,
          offset,
          sort: "latest",
        })

        setState((prev) => {
          const nextItems = reset ? payload.items || [] : [...prev.comments, ...(payload.items || [])]
          return {
            ...prev,
            commentsLoading: false,
            commentsError: "",
            comments: nextItems,
            commentsTotal: Number(payload.total || 0),
            commentsHasMore: Boolean(payload.has_more),
            commentsNextOffset: Number(payload.offset || 0) + (payload.items?.length || 0),
          }
        })
      } catch (error) {
        setState((prev) => ({
          ...prev,
          commentsLoading: false,
          commentsError: error instanceof Error ? error.message : "评论加载失败",
        }))
      }
    },
    [postID]
  )

  const reload = useCallback(async () => {
    await Promise.all([loadDetail(), loadComments(true, 0)])
  }, [loadComments, loadDetail])

  useEffect(() => {
    void reload()
  }, [reload])

  const submitComment = useCallback(
    async (content: string, parentID = 0): Promise<ForumCreateCommentResp> => {
      const token = getAccessToken()
      if (!token) {
        throw new Error("请先登录后再评论")
      }

      const normalized = content.trim()
      if (!normalized) {
        throw new Error("评论内容不能为空")
      }

      setState((prev) => ({ ...prev, submittingComment: true }))
      try {
        const created = await forumAPI.createComment(postID, {
          parent_id: parentID > 0 ? parentID : undefined,
          content: normalized,
        })
        await Promise.all([loadDetail(), loadComments(true, 0)])
        return created
      } finally {
        setState((prev) => ({ ...prev, submittingComment: false }))
      }
    },
    [loadComments, loadDetail, postID]
  )

  const togglePostLike = useCallback(async (): Promise<ForumToggleLikeResp> => {
    if (!getAccessToken()) {
      throw new Error("请先登录后再点赞")
    }

    setState((prev) => ({ ...prev, togglingPostLike: true }))
    try {
      const payload = await forumAPI.toggleTopicLike(postID)
      setState((prev) => {
        if (!prev.detail) return prev
        return {
          ...prev,
          detail: {
            ...prev.detail,
            topic: {
              ...prev.detail.topic,
              like_count: Number(payload.like_count || 0),
            },
          },
        }
      })
      return payload
    } finally {
      setState((prev) => ({ ...prev, togglingPostLike: false }))
    }
  }, [postID])

  const toggleCommentLike = useCallback(async (commentID: number): Promise<ForumToggleLikeResp> => {
    if (!getAccessToken()) {
      throw new Error("请先登录后再点赞")
    }

    if (!Number.isFinite(commentID) || commentID <= 0) {
      throw new Error("评论 ID 无效")
    }

    setState((prev) => ({ ...prev, togglingCommentID: commentID }))
    try {
      const payload = await forumAPI.toggleCommentLike(commentID)
      const nextLikeCount = Number(payload.like_count || 0)

      setState((prev) => ({
        ...prev,
        comments: prev.comments.map((item) => {
          if (item.id === commentID) {
            return {
              ...item,
              likes: nextLikeCount,
            }
          }

          const nextReplies = (item.replies || []).map((reply) => {
            if (reply.id === commentID) {
              return {
                ...reply,
                likes: nextLikeCount,
              }
            }
            return reply
          })

          return {
            ...item,
            replies: nextReplies,
          }
        }),
      }))

      return payload
    } finally {
      setState((prev) => ({ ...prev, togglingCommentID: 0 }))
    }
  }, [])

  const toggleFollow = useCallback(async (): Promise<UserFollowToggleResp> => {
    if (!getAccessToken()) {
      throw new Error("请先登录后再关注")
    }

    const authorID = Number(state.detail?.author?.id || state.detail?.topic?.user_id || 0)
    if (!authorID) {
      throw new Error("作者信息缺失")
    }

    setState((prev) => ({ ...prev, togglingFollow: true }))
    try {
      const payload = await forumAPI.followToggle(authorID)
      setState((prev) => {
        if (!prev.detail) {
          return {
            ...prev,
            following: Boolean(payload.following),
          }
        }

        return {
          ...prev,
          following: Boolean(payload.following),
          detail: {
            ...prev.detail,
            author: {
              ...prev.detail.author,
              stats: {
                ...prev.detail.author.stats,
                fans_count: Number(payload.target_fans_count || prev.detail.author.stats.fans_count || 0),
              },
            },
          },
        }
      })
      return payload
    } finally {
      setState((prev) => ({ ...prev, togglingFollow: false }))
    }
  }, [state.detail])

  const canInteract = Boolean(getAccessToken())

  return {
    state,
    canInteract,
    reload,
    loadMoreComments: () => loadComments(false, state.commentsNextOffset),
    submitComment,
    togglePostLike,
    toggleCommentLike,
    toggleFollow,
  }
}
