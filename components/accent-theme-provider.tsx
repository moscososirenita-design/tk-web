"use client"

import * as React from "react"

// AccentTheme 只决定按钮、强调边框、直播球等高亮色，不直接决定深浅背景。
export type AccentTheme = "gold" | "blue" | "purple" | "red" | "silver" | "jade"

// 强调色单独存储，避免和 next-themes 的 `theme` 键互相覆盖。
const ACCENT_THEME_STORAGE_KEY = "tk-web-accent-theme"
const DEFAULT_ACCENT_THEME: AccentTheme = "gold"

// 兼容旧版本的“深色/浅色 + 配色”一体化主题名，保证老用户刷新后颜色不丢。
const LEGACY_THEME_TO_ACCENT: Record<string, AccentTheme> = {
  "dark-gold": "gold",
  "dark-blue": "blue",
  "dark-purple": "purple",
  "dark-red": "red",
  "light-silver": "silver",
  "light-jade": "jade",
  light: "silver",
}

interface AccentThemeContextValue {
  accentTheme: AccentTheme
  setAccentTheme: (theme: AccentTheme) => void
}

const AccentThemeContext = React.createContext<AccentThemeContextValue | undefined>(undefined)

function isAccentTheme(value: string | null): value is AccentTheme {
  return value === "gold" || value === "blue" || value === "purple" || value === "red" || value === "silver" || value === "jade"
}

function resolveInitialAccentTheme(): AccentTheme {
  // SSR 阶段读取不到浏览器存储，因此先回退到默认配色，等客户端再纠正。
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT_THEME
  }

  // 优先采用新的独立强调色配置。
  const storedAccentTheme = window.localStorage.getItem(ACCENT_THEME_STORAGE_KEY)
  if (isAccentTheme(storedAccentTheme)) {
    return storedAccentTheme
  }

  // 如果没找到新配置，则尝试从旧主题名里推断出对应强调色。
  const legacyTheme = window.localStorage.getItem("theme") || ""
  return LEGACY_THEME_TO_ACCENT[legacyTheme] || DEFAULT_ACCENT_THEME
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentTheme, setAccentThemeState] = React.useState<AccentTheme>(DEFAULT_ACCENT_THEME)

  React.useEffect(() => {
    // 初次挂载时同步真实强调色到 state、DOM 和 localStorage。
    const initialAccentTheme = resolveInitialAccentTheme()
    setAccentThemeState(initialAccentTheme)
    document.documentElement.dataset.accent = initialAccentTheme
    window.localStorage.setItem(ACCENT_THEME_STORAGE_KEY, initialAccentTheme)
  }, [])

  const setAccentTheme = React.useCallback((theme: AccentTheme) => {
    // 任何一次切换都要同时更新三个位置，否则刷新后或样式读取时会出现不一致。
    setAccentThemeState(theme)
    document.documentElement.dataset.accent = theme
    window.localStorage.setItem(ACCENT_THEME_STORAGE_KEY, theme)
  }, [])

  return (
    <AccentThemeContext.Provider value={{ accentTheme, setAccentTheme }}>
      {children}
    </AccentThemeContext.Provider>
  )
}

export function useAccentTheme() {
  const context = React.useContext(AccentThemeContext)

  // 主题 hook 必须在 Provider 内使用，直接抛错能更早暴露接线问题。
  if (!context) {
    throw new Error("useAccentTheme must be used within AccentThemeProvider")
  }

  return context
}
