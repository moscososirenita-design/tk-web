import type {
  LotteryCommentItem,
  LotteryDetailBanner,
  LotteryDetailCurrentData,
  LotteryDetailData,
  LotteryDrawDetailData,
  LotteryExternalLinkItem,
  LotteryHistoryData,
  LotteryHistoryItem,
  LotteryIssueOption,
  LotteryPollOption,
  LotteryRecommendItem,
} from "@/src/features/lottery/model/types"

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return fallback
}

function toBoolean(value: unknown): boolean {
  return Boolean(value)
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toStringValue(item)).filter(Boolean) : []
}

function toNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.map((item) => toNumber(item)) : []
}

function normalizeIssue(item: unknown): LotteryIssueOption {
  const raw = (item || {}) as Partial<LotteryIssueOption>
  return {
    id: toNumber(raw.id),
    issue: toStringValue(raw.issue),
    year: toNumber(raw.year),
  }
}

function normalizePollOption(item: unknown): LotteryPollOption {
  const raw = (item || {}) as Partial<LotteryPollOption>
  return {
    id: toNumber(raw.id),
    name: toStringValue(raw.name),
    votes: toNumber(raw.votes),
    percent: toNumber(raw.percent),
  }
}

function normalizeDetailBanner(item: unknown): LotteryDetailBanner {
  const raw = (item || {}) as Partial<LotteryDetailBanner>
  return {
    id: toNumber(raw.id),
    title: toStringValue(raw.title),
    image_url: toStringValue(raw.image_url),
    link_url: toStringValue(raw.link_url),
    type: toStringValue(raw.type),
    positions: toStringValue(raw.positions),
    jump_type: toStringValue(raw.jump_type),
    jump_post_id: toNumber(raw.jump_post_id),
    jump_url: toStringValue(raw.jump_url),
    content_html: toStringValue(raw.content_html),
  }
}

function normalizeRecommendItem(item: unknown): LotteryRecommendItem {
  const raw = (item || {}) as Partial<LotteryRecommendItem>
  return {
    id: toNumber(raw.id),
    title: toStringValue(raw.title),
    issue: toStringValue(raw.issue),
    cover_image_url: toStringValue(raw.cover_image_url),
  }
}

function normalizeExternalLink(item: unknown): LotteryExternalLinkItem {
  const raw = (item || {}) as Partial<LotteryExternalLinkItem>
  return {
    id: toNumber(raw.id),
    name: toStringValue(raw.name),
    url: toStringValue(raw.url),
  }
}

function normalizeComment(item: unknown): LotteryCommentItem {
  const raw = (item || {}) as Partial<LotteryCommentItem>
  return {
    id: toNumber(raw.id),
    user_id: toNumber(raw.user_id),
    parent_id: toNumber(raw.parent_id),
    content: toStringValue(raw.content),
    likes: toNumber(raw.likes),
    created_at: toStringValue(raw.created_at),
    username: toStringValue(raw.username),
    nickname: toStringValue(raw.nickname),
    avatar: toStringValue(raw.avatar),
    user_type: toStringValue(raw.user_type),
  }
}

function normalizeDetailCurrent(item: unknown): LotteryDetailCurrentData {
  const raw = (item || {}) as Partial<LotteryDetailCurrentData>
  return {
    id: toNumber(raw.id),
    special_lottery_id: toNumber(raw.special_lottery_id),
    title: toStringValue(raw.title),
    issue: toStringValue(raw.issue),
    year: toNumber(raw.year),
    draw_issue: toStringValue(raw.draw_issue),
    draw_year: toNumber(raw.draw_year),
    draw_record_id: toNumber(raw.draw_record_id),
    detail_image_url: toStringValue(raw.detail_image_url),
    draw_code: toStringValue(raw.draw_code),
    normal_draw_result: toStringValue(raw.normal_draw_result),
    special_draw_result: toStringValue(raw.special_draw_result),
    draw_result: toStringValue(raw.draw_result),
    draw_numbers: toNumberArray(raw.draw_numbers),
    draw_labels: toStringArray(raw.draw_labels),
    color_labels: toStringArray(raw.color_labels),
    zodiac_labels: toStringArray(raw.zodiac_labels),
    wuxing_labels: toStringArray(raw.wuxing_labels),
    playback_url: toStringValue(raw.playback_url),
    likes_count: toNumber(raw.likes_count),
    comment_count: toNumber(raw.comment_count),
    favorite_count: toNumber(raw.favorite_count),
    read_count: toNumber(raw.read_count),
  }
}

export function normalizeLotteryHistoryItem(item: unknown): LotteryHistoryItem {
  const raw = (item || {}) as Partial<LotteryHistoryItem>
  return {
    id: toNumber(raw.id),
    special_lottery_id: toNumber(raw.special_lottery_id),
    special_lottery_name: toStringValue(raw.special_lottery_name),
    issue: toStringValue(raw.issue),
    year: toNumber(raw.year),
    draw_at: toStringValue(raw.draw_at),
    draw_time: toStringValue(raw.draw_time),
    normal_draw_result: toStringValue(raw.normal_draw_result),
    special_draw_result: toStringValue(raw.special_draw_result),
    draw_result: toStringValue(raw.draw_result),
    numbers: toNumberArray(raw.numbers),
    labels: toStringArray(raw.labels),
    pair_labels: toStringArray(raw.pair_labels),
    color_labels: toStringArray(raw.color_labels),
    zodiac_labels: toStringArray(raw.zodiac_labels),
    wuxing_labels: toStringArray(raw.wuxing_labels),
    playback_url: toStringValue(raw.playback_url),
    video_url: toStringValue(raw.video_url),
    cover_image_url: toStringValue(raw.cover_image_url),
    special_single_double: toStringValue(raw.special_single_double),
    special_big_small: toStringValue(raw.special_big_small),
    sum_single_double: toStringValue(raw.sum_single_double),
    sum_big_small: toStringValue(raw.sum_big_small),
    special_code: toStringValue(raw.special_code),
    normal_code: toStringValue(raw.normal_code),
    zheng1: toStringValue(raw.zheng1),
    zheng2: toStringValue(raw.zheng2),
    zheng3: toStringValue(raw.zheng3),
    zheng4: toStringValue(raw.zheng4),
    zheng5: toStringValue(raw.zheng5),
    zheng6: toStringValue(raw.zheng6),
  }
}

export function normalizeLotteryHistoryPayload(payload: unknown): LotteryHistoryData {
  const raw = (payload || {}) as Partial<LotteryHistoryData>
  return {
    lottery_info_id: toNumber(raw.lottery_info_id),
    special_lottery_id: toNumber(raw.special_lottery_id),
    special_lottery_name: toStringValue(raw.special_lottery_name),
    title: toStringValue(raw.title),
    year: toNumber(raw.year, new Date().getFullYear()),
    order_mode: toStringValue(raw.order_mode, "desc"),
    show_five: toBoolean(raw.show_five),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeLotteryHistoryItem) : [],
  }
}

export function normalizeLotteryDrawDetailPayload(payload: unknown): LotteryDrawDetailData {
  const raw = (payload || {}) as Partial<LotteryDrawDetailData>
  return {
    id: toNumber(raw.id),
    special_lottery_id: toNumber(raw.special_lottery_id),
    special_lottery_name: toStringValue(raw.special_lottery_name),
    issue: toStringValue(raw.issue),
    year: toNumber(raw.year),
    draw_at: toStringValue(raw.draw_at),
    draw_time: toStringValue(raw.draw_time),
    normal_draw_result: toStringValue(raw.normal_draw_result),
    special_draw_result: toStringValue(raw.special_draw_result),
    draw_result: toStringValue(raw.draw_result),
    numbers: toNumberArray(raw.numbers),
    labels: toStringArray(raw.labels),
    pair_labels: toStringArray(raw.pair_labels),
    color_labels: toStringArray(raw.color_labels),
    zodiac_labels: toStringArray(raw.zodiac_labels),
    wuxing_labels: toStringArray(raw.wuxing_labels),
    playback_url: toStringValue(raw.playback_url),
    recommend_six: toStringValue(raw.recommend_six),
    recommend_four: toStringValue(raw.recommend_four),
    recommend_one: toStringValue(raw.recommend_one),
    recommend_ten: toStringValue(raw.recommend_ten),
    special_single_double: toStringValue(raw.special_single_double),
    special_big_small: toStringValue(raw.special_big_small),
    sum_single_double: toStringValue(raw.sum_single_double),
    sum_big_small: toStringValue(raw.sum_big_small),
    special_code: toStringValue(raw.special_code),
    normal_code: toStringValue(raw.normal_code),
    zheng1: toStringValue(raw.zheng1),
    zheng2: toStringValue(raw.zheng2),
    zheng3: toStringValue(raw.zheng3),
    zheng4: toStringValue(raw.zheng4),
    zheng5: toStringValue(raw.zheng5),
    zheng6: toStringValue(raw.zheng6),
    result_bundle: (raw.result_bundle || {}) as LotteryDrawDetailData["result_bundle"],
  }
}

export function normalizeLotteryDetailPayload(payload: unknown): LotteryDetailData {
  const raw = (payload || {}) as Partial<LotteryDetailData>
  return {
    current: normalizeDetailCurrent(raw.current),
    years: toNumberArray(raw.years),
    issues: Array.isArray(raw.issues) ? raw.issues.map(normalizeIssue) : [],
    poll_options: Array.isArray(raw.poll_options) ? raw.poll_options.map(normalizePollOption) : [],
    poll_enabled: toBoolean(raw.poll_enabled),
    poll_default_open: toBoolean(raw.poll_default_open),
    show_metrics: toBoolean(raw.show_metrics),
    detail_banners: Array.isArray(raw.detail_banners) ? raw.detail_banners.map(normalizeDetailBanner) : [],
    recommend_items: Array.isArray(raw.recommend_items) ? raw.recommend_items.map(normalizeRecommendItem) : [],
    external_links: Array.isArray(raw.external_links) ? raw.external_links.map(normalizeExternalLink) : [],
    system_comments: Array.isArray(raw.system_comments) ? raw.system_comments.map(normalizeComment) : [],
    user_comments: Array.isArray(raw.user_comments) ? raw.user_comments.map(normalizeComment) : [],
    hot_comments: Array.isArray(raw.hot_comments) ? raw.hot_comments.map(normalizeComment) : [],
    latest_comments: Array.isArray(raw.latest_comments) ? raw.latest_comments.map(normalizeComment) : [],
  }
}
