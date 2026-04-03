import type { LotteryDashboardData } from "@/src/shared/contracts/lottery"

// BannerItem 描述首页轮播项；type 用来区分广告位和官方位。
export interface BannerItem {
  id: number
  title: string
  image_url: string
  link_url?: string
  type: "ad" | "official" | string
}

// BroadcastItem 对应顶部广播栏的单条滚动消息。
export interface BroadcastItem {
  id: number
  title: string
  content: string
}

// HomePopupItem 用于首页弹窗营销/公告配置。
export interface HomePopupItem {
  id: number
  title: string
  content: string
  image_url: string
  button_text: string
  button_link: string
  show_once: boolean
}

// SpecialLotteryTab 描述首页顶部彩种切换 tab，同时包含当前期号与下一期开奖时间。
export interface SpecialLotteryTab {
  id: number
  name: string
  code: string
  current_issue: string
  next_draw_at: string
}

// LotteryCardItem 是图纸/资料区的最小卡片数据结构。
export interface LotteryCardItem {
  id: number
  special_lottery_id: number
  category_tag: string
  title: string
  issue: string
  cover_image_url: string
  draw_code: string
  draw_at: string
}

// HomeLinkItem 用于外链、浮动广告和快捷入口这类统一链接结构。
export interface HomeLinkItem {
  id: number
  name: string
  url: string
  position: string
  icon_url?: string
}

// HomeThemeConfig 对应后台可下发的首页主题配置。
export interface HomeThemeConfig {
  id: number
  name: string
  background_image_url: string
  link_url?: string
}

// 左右浮动广告分别复用同一套链接结构。
export interface HomeFloatingAds {
  left: HomeLinkItem[]
  right: HomeLinkItem[]
}

// FeatureFlags 承接后台开关类配置，避免在页面里散落布尔字段。
export interface HomeFeatureFlags {
  show_stats_banner?: boolean
}

// KingKongItem 对应首页金刚区/快捷导航项。
export interface KingKongItem {
  id: number
  name: string
  url: string
  icon_url?: string
  group_key?: string
}

// LotteryCategoryItem 用于图纸分类切换。
export interface LotteryCategoryItem {
  key: string
  name: string
  show_on_home?: number
}

// DashboardData 是首页直播/开奖主舞台的聚合数据。
export type DashboardData = LotteryDashboardData

// HomeOverviewResp 是首页 overview 接口的总入口返回。
export interface HomeOverviewResp {
  title: string
  server_time: string
  active_tab_id: number
  special_lotteries: SpecialLotteryTab[]
  external_links: HomeLinkItem[]
  kingkong_navs: KingKongItem[]
  lottery_categories: LotteryCategoryItem[]
  default_category: string
  banners: {
    ad: BannerItem[]
    official: BannerItem[]
  }
  broadcasts: BroadcastItem[]
  home_popup?: HomePopupItem | null
  home_theme?: HomeThemeConfig | null
  floating_ads?: HomeFloatingAds
  feature_flags?: HomeFeatureFlags | null
  home_blocks?: HomeFeatureFlags | null
  show_stats_banner?: boolean
}

// 图纸列表返回结构。
export interface LotteryCardsResp {
  items: LotteryCardItem[]
}
