"use client"

import { useState } from "react"
import { MessageCircle, Send, X, Minimize2, Users, Smile } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { cn } from "@/lib/utils"

const mockMessages = [
  { id: 1, user: "幸运之星", avatar: "🎯", message: "今期澳彩看好单数！", time: "刚刚", isAdmin: false },
  { id: 2, user: "系统", avatar: "🤖", message: "欢迎来到实时聊天室", time: "1分钟前", isAdmin: true },
  { id: 3, user: "金牌预测", avatar: "🏆", message: "上期中了三码，分享一下心得", time: "2分钟前", isAdmin: false },
  { id: 4, user: "六合大师", avatar: "🔮", message: "大家好，今晚有人一起看开奖吗？", time: "3分钟前", isAdmin: false },
  { id: 5, user: "彩票达人", avatar: "💎", message: "感觉这期会出大号", time: "5分钟前", isAdmin: false },
]

export function LiveChat() {
  // 当前聊天室仍然是本地演示数据，后续可直接替换成真实 websocket / 轮询数据源。
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        // 收起状态下只保留一个悬浮入口，尽量减少对主内容区的打扰。
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110 md:bottom-6 md:right-6"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          5
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed z-50 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl transition-all duration-300",
        // 最小化时保留标题栏即可，展开时桌面端走面板、移动端贴底全屏。
        isMinimized
          ? "bottom-4 right-4 h-14 w-72 md:bottom-6 md:right-6"
          : "bottom-0 right-0 h-[100dvh] w-full sm:bottom-6 sm:right-6 sm:h-[500px] sm:w-96 sm:rounded-2xl"
      )}
    >
      {/* 聊天头部负责展示在线状态，并提供最小化与关闭两个控制入口。 */}
      <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">实时聊天室</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>1,234 在线</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            // 最小化只影响面板高度，不销毁聊天内容，方便用户随时展开继续阅读。
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 消息区域单独滚动，这样输入框可以稳定固定在底部。 */}
          <div className="flex h-[calc(100%-8rem)] flex-col gap-3 overflow-y-auto p-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 rounded-xl p-3 transition-colors",
                  // 系统消息用主色底衬强调，普通用户消息则走次级底色，阅读层次更清晰。
                  msg.isAdmin ? "bg-primary/10" : "bg-secondary/50"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-lg">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        msg.isAdmin ? "text-primary" : "text-foreground"
                      )}
                    >
                      {msg.user}
                    </span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 输入区固定在底部，避免消息较多时发言入口被挤出视口。 */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-card p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                // 这里只保留本地输入状态，发送逻辑后续接入实时服务时再补全。
                placeholder="输入消息..."
                className="flex-1 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button size="icon" className="shrink-0 bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
