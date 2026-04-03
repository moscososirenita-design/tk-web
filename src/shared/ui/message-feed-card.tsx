import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MessageFeedCardProps {
  title: string
  content: string
  timestampText: string
  icon: ReactNode
  unread?: boolean
  onClick?: () => void
}

export function MessageFeedCard({
  title,
  content,
  timestampText,
  icon,
  unread = false,
  onClick,
}: MessageFeedCardProps) {
  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "rounded-[26px] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] transition-all lg:rounded-2xl lg:shadow-none",
        onClick ? "cursor-pointer hover:translate-y-[-1px]" : "",
        unread
          ? "bg-primary/8 hover:bg-primary/10 lg:border lg:border-primary/35 lg:bg-primary/5 lg:hover:border-primary/45"
          : "bg-secondary/10 lg:border lg:border-border/60 lg:bg-background/45"
      )}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-base font-semibold text-foreground">{title}</h2>
            {unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" /> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{content}</p>
          <p className="mt-2 text-xs text-muted-foreground">{timestampText}</p>
        </div>
      </div>
    </article>
  )
}
