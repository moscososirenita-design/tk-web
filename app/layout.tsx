import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import { SwipeBackGesture } from "@/src/shared/layout/swipe-back-gesture"
import './globals.css'

// 统一注册全站正文字体，避免在具体页面里重复声明字体资源。
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

// 等宽字体主要服务于数字、计时器、统计值等强调“视觉对齐”的场景。
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

// 根布局 metadata 是整站默认 SEO 信息。
// 如果后续某个页面需要单独 title/description，可以在具体路由里继续覆盖。
export const metadata: Metadata = {
  title: '幸运彩票 | 实时开奖 · 专业分析 · 赢在起点',
  description: '最专业的彩票开奖平台，实时更新各大彩种开奖结果，专家分析预测，社区交流互动',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// viewport 配置放在根布局中统一声明，确保移动端首屏缩放行为一致。
export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {/* ThemeProvider 统一托管背景模式与强调色，不让页面自己维护主题状态。 */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark-gold"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SwipeBackGesture />
          {children}
        </ThemeProvider>
        {/* 分析脚本只在生产环境注入，避免开发阶段引入无意义噪音。 */}
        {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
      </body>
    </html>
  )
}
