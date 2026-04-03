'use client'

import * as React from 'react'
import { AccentThemeProvider } from '@/components/accent-theme-provider'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    // 背景模式仍然交给 next-themes 管理，这样系统主题联动可以继续复用成熟能力。
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark-gold"
      themes={["dark", "light", "dark-gold", "dark-blue", "dark-purple", "dark-red", "light-jade", "light-silver", "system"]}
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {/* 强调色单独抽到 AccentThemeProvider，让“背景模式”和“按钮配色”变成多对多组合。 */}
      <AccentThemeProvider>{children}</AccentThemeProvider>
    </NextThemesProvider>
  )
}
