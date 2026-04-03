"use client"

import { Palette, Check, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { useAccentTheme, type AccentTheme } from "@/components/accent-theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu"
import { useTheme } from "next-themes"

const backgroundThemes = [
  {
    value: "system" as const,
    label: "跟随系统",
    icon: Monitor,
  },
  {
    value: "dark" as const,
    label: "深色背景",
    icon: Moon,
  },
  {
    value: "light" as const,
    label: "浅色背景",
    icon: Sun,
  },
]

const accentThemes: Array<{
  value: AccentTheme
  label: string
  color: string
}> = [
  { value: "gold", label: "鎏金", color: "#e0b94d" },
  { value: "blue", label: "深海蓝", color: "#4f8df7" },
  { value: "purple", label: "霓光紫", color: "#9b5cf6" },
  { value: "red", label: "绯红", color: "#ef4444" },
  { value: "silver", label: "银白", color: "#94a3b8" },
  { value: "jade", label: "玉石绿", color: "#10b981" },
]

function normalizeThemeMode(theme: string | undefined) {
  // 旧版本里保留了 `light-jade`、`dark-gold` 之类主题名。
  // 当前 UI 只想展示“背景模式”三种状态，因此这里先做一次归一化。
  if (theme === "system") {
    return "system"
  }

  if (theme?.startsWith("light")) {
    return "light"
  }

  return "dark"
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { accentTheme, setAccentTheme } = useAccentTheme()
  const activeMode = normalizeThemeMode(theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          // 触发按钮本身也跟着主题主色走 hover，避免出现“当前选鎏金但 hover 还是蓝色”的割裂感。
          className="relative rounded-2xl border border-border/60 bg-background/70 text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Palette className="h-5 w-5" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border border-border/60 p-3">
        <DropdownMenuLabel>背景模式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-3 gap-2 pb-1">
          {backgroundThemes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              // 背景模式做成横向三按钮，比传统下拉列表更容易让用户意识到“这是切换开关”。
              className={
                activeMode === t.value
                  ? "flex flex-col items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-2 py-3 text-primary shadow-sm ring-1 ring-primary/15"
                  : "flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/20 px-2 py-3 text-muted-foreground transition-all hover:border-primary/25 hover:bg-secondary/45 hover:text-foreground"
              }
            >
              <div
                className={
                  activeMode === t.value
                    ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 shadow-sm"
                    : "flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm"
                }
              >
                <t.icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>按钮配色</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-2">
          {accentThemes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setAccentTheme(t.value)}
              // 配色列表更像色板，用户会先通过颜色预判，再通过名称确认。
              className={
                accentTheme === t.value
                  ? "flex w-full items-center gap-3 rounded-xl border border-primary/40 bg-primary/8 px-3 py-3 text-left shadow-sm ring-1 ring-primary/15"
                  : "flex w-full items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3 py-3 text-left transition-all hover:border-primary/20 hover:bg-secondary/45"
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-5 w-5 shrink-0 rounded-full ring-2 ring-white/70 shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className={accentTheme === t.value ? "text-sm font-semibold text-foreground" : "text-sm font-medium text-foreground/88"}>
                  {t.label}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div
                    className="h-1.5 flex-1 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${t.color} 0%, color-mix(in srgb, ${t.color} 60%, white) 100%)` }}
                  />
                  <div className="h-1.5 w-8 rounded-full bg-border/60" />
                </div>
              </div>
              {accentTheme === t.value ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
