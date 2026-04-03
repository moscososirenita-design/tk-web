// 彩票域共享契约：与 tk-proto 中的 lottery_types.proto 保持字段语义一致。

export interface LotterySpecialLotterySummary {
  id: number
  name: string
  code: string
  current_issue: string
  next_draw_at: string
}

export interface LotteryLiveSummary {
  show_player: boolean
  has_data: boolean
  status: string
  stream_url: string
}

export interface LotteryNumberDetail {
  number: number
  position: number
  color_wave: string
  big_small: string
  single_double: string
  sum_single_double: string
  tail_big_small: string
  zodiac: string
  wuxing: string
  beast: string
  tail_label: string
}

export interface LotteryLabelSet {
  pair_labels: string[]
  color_labels: string[]
  zodiac_labels: string[]
  wuxing_labels: string[]
}

export interface LotteryDrawAnalytics {
  special_single_double: string
  special_big_small: string
  sum_single_double: string
  sum_big_small: string
  special_code: string
  normal_code: string
  zheng1: string
  zheng2: string
  zheng3: string
  zheng4: string
  zheng5: string
  zheng6: string
}

export interface LotteryDashboardDraw extends LotteryDrawAnalytics {
  draw_record_id: number
  special_lottery_id: number
  issue: string
  draw_at: string
  normal_numbers: number[]
  special_number?: number
  draw_result: string
  playback_url?: string
  numbers: number[]
  labels: string[]
  pair_labels: string[]
  color_labels: string[]
  zodiac_labels: string[]
  wuxing_labels: string[]
}

export interface LotteryDashboardData {
  special_lottery: LotterySpecialLotterySummary
  live: LotteryLiveSummary
  draw: LotteryDashboardDraw
}

export interface LotteryHistoryItem extends LotteryDrawAnalytics {
  id: number
  special_lottery_id?: number
  special_lottery_name?: string
  issue: string
  year: number
  draw_at: string
  draw_time?: string
  normal_draw_result?: string
  special_draw_result?: string
  draw_result: string
  numbers: number[]
  labels: string[]
  pair_labels: string[]
  color_labels: string[]
  zodiac_labels: string[]
  wuxing_labels: string[]
  playback_url?: string
  video_url?: string
  cover_image_url?: string
}

export interface LotteryHistoryData {
  lottery_info_id?: number
  special_lottery_id: number
  special_lottery_name?: string
  title?: string
  year: number
  order_mode?: "asc" | "desc" | string
  show_five?: boolean
  items: LotteryHistoryItem[]
}

export interface LotterySpecialResultData {
  special_number: number
  special_color_wave: string
  special_big_small: string
  special_single_double: string
  special_sum_single_double: string
  special_tail_big_small: string
  special_zodiac: string
  special_wuxing: string
  special_home_beast: string
  half_wave_color_size: string
  half_wave_color_parity: string
  payload: {
    special: LotteryNumberDetail
    two_sides: string[]
    half_wave_color_size: string
    half_wave_color_parity: string
  }
}

export interface LotteryRegularResultData {
  normal_numbers: number[]
  total_sum: number
  total_big_small: string
  total_single_double: string
  zheng1: string
  zheng2: string
  zheng3: string
  zheng4: string
  zheng5: string
  zheng6: string
  positions: LotteryNumberDetail[]
}

export interface LotteryCountResultData {
  total_sum: number
  odd_count: number
  even_count: number
  big_count: number
  small_count: number
  distinct_zodiac_count: number
  distinct_tail_count: number
  distinct_wuxing_count: number
  appeared_zodiacs: string[]
  missed_zodiacs: string[]
  appeared_tails: string[]
  missed_tails: string[]
  appeared_wuxings: string[]
}

export interface LotteryZodiacTailResultData {
  special_zodiac: string
  special_home_beast: string
  special_wuxing: string
  hit_zodiacs: string[]
  miss_zodiacs: string[]
  hit_tails: string[]
  miss_tails: string[]
  home_beast_zodiacs: string[]
  wild_beast_zodiacs: string[]
}

export interface LotteryComboResultData {
  normal_numbers: number[]
  all_numbers: number[]
  special_number: number
}

export interface LotteryResultBundleData {
  labels: LotteryLabelSet
  special_result: LotterySpecialResultData
  regular_result: LotteryRegularResultData
  count_result: LotteryCountResultData
  zodiac_tail_result: LotteryZodiacTailResultData
  combo_result: LotteryComboResultData
}

export interface LotteryDrawDetailData extends LotteryDrawAnalytics {
  id: number
  special_lottery_id: number
  special_lottery_name: string
  issue: string
  year: number
  draw_at: string
  draw_time: string
  normal_draw_result: string
  special_draw_result: string
  draw_result: string
  numbers: number[]
  labels: string[]
  pair_labels: string[]
  color_labels: string[]
  zodiac_labels: string[]
  wuxing_labels: string[]
  playback_url?: string
  recommend_six?: string
  recommend_four?: string
  recommend_one?: string
  recommend_ten?: string
  result_bundle: LotteryResultBundleData
}

export interface LotteryDetailCurrentData {
  id: number
  special_lottery_id: number
  title: string
  issue: string
  year: number
  draw_issue: string
  draw_year: number
  draw_record_id: number
  detail_image_url: string
  draw_code: string
  normal_draw_result: string
  special_draw_result: string
  draw_result: string
  draw_numbers: number[]
  draw_labels: string[]
  color_labels: string[]
  zodiac_labels: string[]
  wuxing_labels: string[]
  playback_url?: string
  likes_count: number
  comment_count: number
  favorite_count: number
  read_count: number
}

export interface LotteryIssueOption {
  id: number
  issue: string
  year: number
}

export interface LotteryPollOption {
  id: number
  name: string
  votes: number
  percent: number
}

export interface LotteryDetailBanner {
  id: number
  title: string
  image_url: string
  link_url?: string
  type: string
  positions: string
  jump_type?: string
  jump_post_id?: number
  jump_url?: string
  content_html?: string
}

export interface LotteryRecommendItem {
  id: number
  title: string
  issue: string
  cover_image_url: string
}

export interface LotteryExternalLinkItem {
  id: number
  name: string
  url: string
}

export interface LotteryCommentItem {
  id: number
  user_id: number
  parent_id: number
  content: string
  likes: number
  created_at: string
  username: string
  nickname: string
  avatar: string
  user_type: string
}

export interface LotteryDetailData {
  current: LotteryDetailCurrentData
  years: number[]
  issues: LotteryIssueOption[]
  poll_options: LotteryPollOption[]
  poll_enabled: boolean
  poll_default_open: boolean
  show_metrics: boolean
  detail_banners: LotteryDetailBanner[]
  recommend_items: LotteryRecommendItem[]
  external_links: LotteryExternalLinkItem[]
  system_comments: LotteryCommentItem[]
  user_comments: LotteryCommentItem[]
  hot_comments: LotteryCommentItem[]
  latest_comments: LotteryCommentItem[]
}
