"use client"

import Link from "next/link"
import { Shield, Lock, Clock, Headphones } from "lucide-react"

const footerLinks = [
  {
    title: "彩种中心",
    links: ["澳门六合彩", "香港六合彩", "台湾大乐透", "新加坡4D"],
  },
  {
    title: "数据服务",
    links: ["开奖走势", "历史数据", "专家分析", "AI预测"],
  },
  {
    title: "社区互动",
    links: ["论坛交流", "高手排行", "精选图库", "实时聊天"],
  },
  {
    title: "帮助中心",
    links: ["新手指南", "常见问题", "联系客服", "意见反馈"],
  },
]

const trustBadges = [
  { icon: Shield, label: "安全保障" },
  { icon: Lock, label: "隐私保护" },
  { icon: Clock, label: "24/7服务" },
  { icon: Headphones, label: "专业客服" },
]

export function Footer() {
  return (
    // Footer 只在中大屏显示；移动端已有底部导航，不再重复占用首屏高度。
    <footer className="hidden border-t border-border/50 bg-card/50 lg:block">
      {/* Trust Badges */}
      <div className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustBadges.map((badge, index) => (
              // 信任标签用轻量信息卡呈现，帮助页脚第一眼先传达站点可信度。
              <div key={index} className="flex items-center justify-center gap-3 rounded-xl bg-secondary/30 p-4">
                <badge.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 主 footer 继续拆成品牌区和链接区，让用户快速理解站点定位和可用入口。 */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                <span className="text-xl font-bold text-primary-foreground">彩</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">幸运彩票</h3>
                <p className="text-xs text-muted-foreground">专业 · 权威 · 实时</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              最专业的彩票开奖平台，为您提供实时、准确的开奖信息和专业的数据分析服务。
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      // 这里仍是静态占位链接，后续如果接真实 CMS 或帮助中心可直接替换 href。
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-background/50">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-muted-foreground">
              © 2026 幸运彩票. 仅供娱乐参考，请理性对待。
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-primary">
                服务条款
              </Link>
              <Link href="#" className="hover:text-primary">
                隐私政策
              </Link>
              <Link href="#" className="hover:text-primary">
                免责声明
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
