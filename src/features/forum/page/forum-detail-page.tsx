"use client"

// 论坛详情页负责帖子正文、作者关系、点赞评论等完整互动能力。
import { useState } from "react"
import { CalendarClock, MessageCircle, Send, ThumbsUp, UserCheck, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { Card, CardContent } from "@/components/ui/display/card"
import { Textarea } from "@/components/ui/forms/textarea"
import { useForumDetailData } from "@/src/features/forum/hooks/use-forum-detail-data"
import { formatDateTime, formatRelativeTime } from "@/src/shared/utils/date"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { StatePanel } from "@/src/shared/ui/state-panel"

interface ForumDetailPageProps {
  postID: number
}

export function ForumDetailPage({ postID }: ForumDetailPageProps) {
  const { state, canInteract, loadMoreComments, submitComment, toggleCommentLike, toggleFollow, togglePostLike } =
    useForumDetailData(postID)
  const { loading, error, detail } = state

  const [commentDraft, setCommentDraft] = useState("")
  const [replyTargetID, setReplyTargetID] = useState(0)
  const [replyDraft, setReplyDraft] = useState("")
  const [tip, setTip] = useState("")

  const submitRootComment = async () => {
    try {
      await submitComment(commentDraft, 0)
      setCommentDraft("")
      setTip("评论已发布")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "评论失败")
    }
  }

  const submitReply = async () => {
    if (!replyTargetID) return
    try {
      await submitComment(replyDraft, replyTargetID)
      setReplyDraft("")
      setReplyTargetID(0)
      setTip("回复已发布")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "回复失败")
    }
  }

  const handlePostLike = async () => {
    try {
      const payload = await togglePostLike()
      setTip(payload.liked ? "点赞成功" : "已取消点赞")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "操作失败")
    }
  }

  const handleFollow = async () => {
    try {
      const payload = await toggleFollow()
      setTip(payload.following ? "已关注作者" : "已取消关注")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "操作失败")
    }
  }

  const handleCommentLike = async (commentID: number) => {
    try {
      const payload = await toggleCommentLike(commentID)
      setTip(payload.liked ? "点赞成功" : "已取消点赞")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "操作失败")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        {loading ? (
          <StatePanel>
            加载中...
          </StatePanel>
        ) : error ? (
          <ErrorBanner>{error}</ErrorBanner>
        ) : !detail ? (
          <StatePanel>
            帖子不存在
          </StatePanel>
        ) : (
          <section className="space-y-4">
            <PageSectionShell as="article" className="lg:rounded-xl">
              <h1 className="mb-3 text-xl font-bold md:text-2xl">{detail.topic.title}</h1>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{detail.author?.display_name || detail.topic.user?.nickname || "匿名用户"}</span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateTime(detail.topic.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {detail.topic.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {state.commentsTotal || detail.comment_total}
                </span>
              </div>

              {detail.topic.cover_image ? (
                <img
                  src={detail.topic.cover_image}
                  alt={detail.topic.title}
                  className="mb-4 max-h-[420px] w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ) : null}

              <div className="prose prose-sm mb-4 max-w-none whitespace-pre-wrap text-sm leading-7 text-foreground">
                {detail.topic.content || detail.topic.content_preview || "暂无正文内容"}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={() => void handlePostLike()} disabled={state.togglingPostLike || !canInteract}>
                  <ThumbsUp className="h-4 w-4" />
                  {state.togglingPostLike ? "处理中..." : `点赞 (${detail.topic.like_count})`}
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => void handleFollow()} disabled={state.togglingFollow || !canInteract}>
                  {state.following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {state.togglingFollow ? "处理中..." : state.following ? "已关注" : "关注作者"}
                </Button>
              </div>
            </PageSectionShell>

            <Card className="border-border/60 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:shadow-none">
              <CardContent className="space-y-3 p-4">
                <h2 className="text-base font-semibold">作者信息</h2>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <p>粉丝：{detail.author?.stats?.fans_count || 0}</p>
                  <p>关注：{detail.author?.stats?.following_count || 0}</p>
                  <p>发帖：{detail.author?.stats?.post_count || 0}</p>
                  <p>成长值：{detail.author?.stats?.growth_value || 0}</p>
                  <p>
                    等级：
                    {state.level ? `${state.level.level_name} (Lv.${state.level.level_no})` : "暂无等级信息"}
                  </p>
                  <p>下一级还需：{state.level?.next_need_growth ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:shadow-none">
              <CardContent className="space-y-3 p-4">
                <h2 className="text-base font-semibold">发表评论</h2>
                <Textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder={canInteract ? "写下你的看法..." : "请先登录后再评论"}
                  disabled={!canInteract || state.submittingComment}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{commentDraft.length}/1000</p>
                  <Button className="gap-2" onClick={() => void submitRootComment()} disabled={!canInteract || state.submittingComment}>
                    <Send className="h-4 w-4" />
                    {state.submittingComment ? "提交中..." : "发布评论"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {state.commentsError ? <ErrorBanner>{state.commentsError}</ErrorBanner> : null}
            {tip ? <p className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">{tip}</p> : null}

            <Card className="border-border/60 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] lg:shadow-none">
              <CardContent className="space-y-3 p-4">
                <h2 className="text-base font-semibold">全部评论 ({state.commentsTotal || detail.comment_total})</h2>

                {state.commentsLoading && state.comments.length === 0 ? (
                  <StatePanel>加载评论中...</StatePanel>
                ) : state.comments.length === 0 ? (
                  <StatePanel>还没有评论，快来抢沙发</StatePanel>
                ) : (
                  <div className="space-y-3">
                    {state.comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{comment.user?.nickname || comment.user?.username || `用户${comment.user_id}`}</span>
                          <span>{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2"
                            onClick={() => void handleCommentLike(comment.id)}
                            disabled={state.togglingCommentID === comment.id || !canInteract}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {comment.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2"
                            onClick={() => {
                              setReplyTargetID((prev) => (prev === comment.id ? 0 : comment.id))
                              setReplyDraft("")
                            }}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            回复 ({comment.reply_count || 0})
                          </Button>
                        </div>

                        {replyTargetID === comment.id ? (
                          <div className="mt-3 space-y-2 rounded-md border border-border/50 bg-background/80 p-2">
                            <Textarea
                              value={replyDraft}
                              onChange={(event) => setReplyDraft(event.target.value)}
                              rows={3}
                              maxLength={1000}
                              placeholder={canInteract ? "回复这条评论..." : "请先登录后再回复"}
                              disabled={!canInteract || state.submittingComment}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setReplyTargetID(0)}>
                                取消
                              </Button>
                              <Button size="sm" onClick={() => void submitReply()} disabled={!canInteract || state.submittingComment}>
                                发送回复
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {(comment.replies || []).length > 0 ? (
                          <div className="mt-3 space-y-2 rounded-md bg-background/70 p-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="rounded-md border border-border/40 bg-secondary/10 p-2">
                                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{reply.user?.nickname || reply.user?.username || `用户${reply.user_id}`}</span>
                                  <span>{formatRelativeTime(reply.created_at)}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 gap-1 px-1 text-xs"
                                  onClick={() => void handleCommentLike(reply.id)}
                                  disabled={state.togglingCommentID === reply.id || !canInteract}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  {reply.likes}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {state.commentsHasMore ? (
                  <div className="flex justify-center pt-2">
                    <Button variant="outline" onClick={() => void loadMoreComments()} disabled={state.commentsLoading}>
                      {state.commentsLoading ? "加载中..." : "加载更多评论"}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
