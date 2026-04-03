"use client"

// 消息中心页负责把通知、互动、私信三类消息统一编排成一个用户可切换的视图。
import type React from "react"
import { useState } from "react"
import { Bell, Heart, Mail, Settings, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { Textarea } from "@/components/ui/forms/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog"
import { messagesAPI, type PrivateMessageItem } from "@/src/features/messages/api/messages-api"
import { useMessagesData, type MessageCategory } from "@/src/features/messages/hooks/use-messages-data"
import { formatRelativeTime } from "@/src/shared/utils/date"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { ErrorBanner } from "@/src/shared/ui/error-banner"
import { MessageFeedCard } from "@/src/shared/ui/message-feed-card"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { PageSectionShell } from "@/src/shared/ui/page-section-shell"
import { PageTitleBar } from "@/src/shared/ui/page-title-bar"
import { StatePanel } from "@/src/shared/ui/state-panel"

interface TabConfig {
  key: MessageCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabConfig: TabConfig[] = [
  { key: "notice", label: "通知", icon: Bell },
  { key: "interaction", label: "互动", icon: Heart },
  { key: "private", label: "私信", icon: Mail }
]

export function MessagesPage() {
  const { state, grouped, currentItems, unreadCount, reload, setActiveTab, markAllRead } = useMessagesData()
  const [conversationOpen, setConversationOpen] = useState(false)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [conversationError, setConversationError] = useState("")
  const [conversationDraft, setConversationDraft] = useState("")
  const [sendingPrivate, setSendingPrivate] = useState(false)
  const [conversationPeer, setConversationPeer] = useState<{ id: number; name: string } | null>(null)
  const [conversationItems, setConversationItems] = useState<PrivateMessageItem[]>([])

  const loadConversation = async (peerUserID: number) => {
    setConversationLoading(true)
    setConversationError("")
    try {
      const payload = await messagesAPI.privateList({ peer_user_id: peerUserID, limit: 80, offset: 0 })
      const peerName = payload.peer_user?.nickname || payload.peer_user?.username || `用户${peerUserID}`
      setConversationPeer({ id: peerUserID, name: peerName })
      setConversationItems([...(payload.items || [])].sort((a, b) => Number(a.id) - Number(b.id)))

      const lastMessageID = Math.max(...(payload.items || []).map((item) => Number(item.id || 0)), 0)
      if (lastMessageID > 0) {
        await messagesAPI.markPrivateRead({
          peer_user_id: peerUserID,
          up_to_message_id: lastMessageID,
        })
        await reload()
      }
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "私信会话加载失败")
      setConversationItems([])
    } finally {
      setConversationLoading(false)
    }
  }

  const openConversation = async (peerUserID: number) => {
    if (!peerUserID) return
    setConversationOpen(true)
    await loadConversation(peerUserID)
  }

  const sendPrivateMessage = async () => {
    if (!conversationPeer) return
    const content = conversationDraft.trim()
    if (!content) return

    setSendingPrivate(true)
    setConversationError("")
    try {
      await messagesAPI.sendPrivate({
        receiver_user_id: conversationPeer.id,
        content,
      })
      setConversationDraft("")
      await loadConversation(conversationPeer.id)
      await reload()
    } catch (error) {
      setConversationError(error instanceof Error ? error.message : "私信发送失败")
    } finally {
      setSendingPrivate(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        <PageSectionShell className="lg:bg-card/85 lg:p-6" padding="page">
          <PageTitleBar
            title="消息中心"
            size="hero"
            actions={
              <Button variant="outline" size="icon" className="h-9 w-9 border-border/70" aria-label="消息设置">
                <Settings className="h-4 w-4" />
              </Button>
            }
          />

          <div className="grid grid-cols-3 gap-2 rounded-[24px] bg-secondary/18 p-1.5 lg:rounded-xl lg:bg-secondary/35">
            {tabConfig.map((tab) => {
              // 未读数按当前 readIDs 实时计算，切 tab 时徽标同步刷新。
              const count = grouped[tab.key].filter((item) => !state.readIDs.includes(item.id)).length
              const active = state.activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-background text-foreground shadow-[0_10px_25px_-15px_rgba(0,0,0,0.9)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  // 切 tab 不需要重新请求，直接消费 memo 过的 grouped 结果即可。
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {count > 0 ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                      {count}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">{unreadCount} 条未读{tabConfig.find((item) => item.key === state.activeTab)?.label}</p>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
              onClick={markAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              全部已读
            </button>
          </div>

          {state.error ? <ErrorBanner className="mt-4">{state.error}</ErrorBanner> : null}

          {state.loading ? (
            <StatePanel className="mt-4 lg:bg-background/50">
              加载中...
            </StatePanel>
          ) : currentItems.length === 0 ? (
            <StatePanel className="mt-4 lg:bg-background/50">
              暂无{tabConfig.find((item) => item.key === state.activeTab)?.label}消息
            </StatePanel>
          ) : (
            <div className="mt-4 space-y-3">
              {currentItems.map((item) => {
                const isRead = state.readIDs.includes(item.id)
                const icon =
                  state.activeTab === "notice" ? (
                    <Bell className="h-4 w-4" />
                  ) : state.activeTab === "interaction" ? (
                    <Heart className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )
                return (
                  <MessageFeedCard
                    key={item.id}
                    title={item.title}
                    content={item.content}
                    icon={icon}
                    unread={!isRead}
                    timestampText={formatRelativeTime(item.createdAt)}
                    onClick={
                      state.activeTab === "private" && item.peerUserID
                        ? () => {
                            void openConversation(Number(item.peerUserID || 0))
                          }
                        : undefined
                    }
                  />
                )
              })}
            </div>
          )}
        </PageSectionShell>
      </main>

      <Footer />
      <MobileNav />

      <Dialog open={conversationOpen} onOpenChange={setConversationOpen}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>{conversationPeer ? `与 ${conversationPeer.name} 的私信` : "私信会话"}</DialogTitle>
            <DialogDescription>支持发送文本消息，发送后会自动刷新会话记录。</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {conversationError ? <ErrorBanner>{conversationError}</ErrorBanner> : null}

            {conversationLoading ? (
              <StatePanel>会话加载中...</StatePanel>
            ) : conversationItems.length === 0 ? (
              <StatePanel>暂无私信内容，发一条消息开始对话吧</StatePanel>
            ) : (
              <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-lg border border-border/60 bg-secondary/15 p-3">
                {conversationItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      item.is_mine
                        ? "ml-8 bg-primary/12 text-foreground"
                        : "mr-8 bg-background text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{item.content || "暂无内容"}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(item.created_at)}</p>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={conversationDraft}
              onChange={(event) => setConversationDraft(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="输入私信内容..."
              disabled={!conversationPeer || sendingPrivate}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConversationOpen(false)}>
              关闭
            </Button>
            <Button onClick={() => void sendPrivateMessage()} disabled={!conversationPeer || sendingPrivate}>
              {sendingPrivate ? "发送中..." : "发送私信"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
