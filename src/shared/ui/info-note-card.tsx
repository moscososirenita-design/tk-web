import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InfoNoteCardProps {
  title: string
  description: string
  icon: ReactNode
  className?: string
}

export function InfoNoteCard({ title, description, icon, className }: InfoNoteCardProps) {
  return (
    <div className={cn("rounded-[24px] bg-secondary/10 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)] lg:rounded-xl lg:border lg:border-border/60 lg:bg-card/70 lg:shadow-none", className)}>
      <p className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {icon}
        {title}
      </p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
