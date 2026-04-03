"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/forms/input"
import { cn } from "@/lib/utils"

interface SearchActionBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder: string
  className?: string
  inputClassName?: string
  triggerClassName?: string
  expandedClassName?: string
  onExpandedChange?: (expanded: boolean) => void
}

export function SearchActionBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  inputClassName,
  triggerClassName,
  expandedClassName,
  onExpandedChange,
}: SearchActionBarProps) {
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateExpanded = (next: boolean) => {
    setExpanded(next)
    onExpandedChange?.(next)
  }

  useEffect(() => {
    if (!expanded) {
      return
    }
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [expanded])

  const handleToggle = () => updateExpanded(!expanded)

  return (
    <div className={cn("relative inline-flex h-11 shrink-0 items-center justify-end lg:h-10", className)}>
      <div
        className={cn(
          "absolute right-full top-1/2 mr-2 -translate-y-1/2 overflow-hidden origin-right will-change-[opacity,transform] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "w-[min(14rem,calc(100vw-5.5rem))] lg:w-[20rem]",
          expanded ? "translate-x-0 scale-x-100 opacity-100" : "translate-x-2 scale-x-95 opacity-0",
          expandedClassName,
          !expanded && "pointer-events-none"
        )}
      >
        <div className="relative min-w-0 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSubmit()
              if (event.key === "Escape") updateExpanded(false)
            }}
            className={cn(
              "h-11 appearance-none rounded-full border-primary/70 !bg-transparent bg-transparent pl-9 pr-9 shadow-none",
              "focus-visible:border-primary/80 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:shadow-none",
              "lg:h-10 lg:rounded-md",
              inputClassName
            )}
            style={{ backgroundColor: "transparent" }}
            placeholder={placeholder}
          />
          <button
            type="button"
            aria-label="收起搜索"
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => updateExpanded(false)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label={expanded ? "收起搜索" : "展开搜索"}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 lg:h-10 lg:w-10 lg:rounded-md",
          triggerClassName
        )}
        onClick={handleToggle}
      >
        <Search className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}
