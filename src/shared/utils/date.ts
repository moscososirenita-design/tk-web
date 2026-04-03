// 日期工具层：统一处理时间格式化、相对时间与倒计时计算。
// 这里所有“开奖相关时间”都按北京时间（东八区 / Asia/Shanghai）解释和展示，
// 不跟随浏览器本地时区走，避免用户在东京、北美等时区看到错误的开奖时间。

const CHINA_TIMEZONE = "Asia/Shanghai"
const CHINA_OFFSET_HOURS = 8
const CHINA_OFFSET_MS = CHINA_OFFSET_HOURS * 60 * 60 * 1000

function pad(value: number): string {
  // 所有时间片段统一补零，保证 01:02:03 这类格式稳定输出。
  return String(Math.max(0, value)).padStart(2, "0")
}

function getChinaDateParts(date: Date): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
} {
  // 使用 Intl 显式按北京时间拆分年月日时分秒，避免浏览器本地时区污染结果。
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: CHINA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const read = (type: string) => Number(parts.find((item) => item.type === type)?.value || 0)

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  }
}

function chinaPartsToDate(parts: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}): Date {
  // 把“北京时间的本地时间”转换成真实 UTC 时间戳：
  // Date.UTC 先把这些数字当成 UTC 组装，再减去 8 小时得到对应的真实瞬时。
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour - CHINA_OFFSET_HOURS,
      parts.minute,
      parts.second,
      0
    )
  )
}

function resolveDateInput(raw: string | number | Date, preferNextOccurrence = false): Date {
  if (raw instanceof Date) {
    return raw
  }

  if (typeof raw === "number") {
    return new Date(raw)
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim()

    // 兼容只给“21:30:00”这种每日固定开奖时刻的情况。
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const [hour, minute, second = "00"] = trimmed.split(":")
      const now = new Date()
      const todayInChina = getChinaDateParts(now)
      let target = chinaPartsToDate({
        year: todayInChina.year,
        month: todayInChina.month,
        day: todayInChina.day,
        hour: Number(hour),
        minute: Number(minute),
        second: Number(second),
      })

      // 倒计时场景下，如果今天北京时间这个时刻已经过去，就顺延到明天。
      if (preferNextOccurrence && target.getTime() < now.getTime()) {
        const tomorrow = new Date(target.getTime() + 24 * 60 * 60 * 1000)
        const tomorrowInChina = getChinaDateParts(tomorrow)
        target = chinaPartsToDate({
          year: tomorrowInChina.year,
          month: tomorrowInChina.month,
          day: tomorrowInChina.day,
          hour: Number(hour),
          minute: Number(minute),
          second: Number(second),
        })
      }

      return target
    }

    // 兼容后端返回“北京时间本地时间串”的情况：
    // 2026-03-21 21:30:00 / 2026/03/21 21:30:00 / 2026-03-21T21:30:00
    if (/^\d{4}[/-]\d{2}[/-]\d{2}(?:\s+|T)\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      const normalized = trimmed.replace(/\//g, "-").replace("T", " ")
      const [datePart, timePart] = normalized.split(" ")
      const [year, month, day] = datePart.split("-").map(Number)
      const [hour, minute, second] = timePart.split(":").map(Number)

      return chinaPartsToDate({
        year,
        month,
        day,
        hour,
        minute,
        second,
      })
    }

    // 已经带 Z / +08:00 / -05:00 这类时区信息的 ISO 串，直接交给 Date 解析。
    if (
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(trimmed) ||
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(trimmed)
    ) {
      return new Date(trimmed)
    }
  }

  return new Date(raw)
}

export function formatDateTime(raw: string | number | Date): string {
  const date = resolveDateInput(raw)
  if (Number.isNaN(date.getTime())) return "-"

  // 统一输出北京时间 yyyy-MM-dd HH:mm:ss，页面层不再自己拼装。
  const china = getChinaDateParts(date)
  return `${china.year}-${pad(china.month)}-${pad(china.day)} ${pad(china.hour)}:${pad(china.minute)}:${pad(china.second)}`
}

export function formatRelativeTime(raw: string | number | Date): string {
  const date = resolveDateInput(raw)
  if (Number.isNaN(date.getTime())) return "刚刚"

  // diff 用真实时间戳比较即可，和展示时区无关。
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "刚刚"
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  // 超过一周就退回绝对时间，避免“23天前”这类文案可读性下降。
  return formatDateTime(date)
}

export function getRemainingSeconds(targetAt: string | number | Date): number {
  const target = resolveDateInput(targetAt, true)
  if (Number.isNaN(target.getTime())) {
    return Number.NEGATIVE_INFINITY
  }

  // 这里保留符号值，方便业务区分“未到开奖时间”和“已经开奖一段时间”。
  return Math.floor((target.getTime() - Date.now()) / 1000)
}

export function getCurrentDrawCycleSeconds(targetAt: string | number | Date): number {
  const nextTarget = resolveDateInput(targetAt, true)
  if (Number.isNaN(nextTarget.getTime())) {
    return Number.NEGATIVE_INFINITY
  }

  const now = Date.now()
  const remainingToNext = Math.floor((nextTarget.getTime() - now) / 1000)

  // 这里专门服务“每天固定开奖时间”的彩种配置：
  // 当 next_draw_at 已经被后台滚到明天，但此刻其实刚过今天的开奖点，
  // 我们需要把当前开奖周期识别成一个“负数秒差”，这样直播窗还能在开奖后短暂显示。
  const previousTarget = new Date(nextTarget.getTime() - 24 * 60 * 60 * 1000)
  const elapsedSincePrevious = Math.floor((now - previousTarget.getTime()) / 1000)

  // 当“距下一次开奖”超过 12 小时，基本可以判定 next_draw_at 已经滚到明天了；
  // 这时优先返回“距今天这次开奖过去了多久”。
  if (remainingToNext > 12 * 60 * 60 && elapsedSincePrevious >= 0) {
    return -elapsedSincePrevious
  }

  return remainingToNext
}

export function toCountdown(targetAt: string | number | Date): {
  expired: boolean
  totalSeconds: number
  hours: number
  minutes: number
  seconds: number
  display: string
} {
  const target = resolveDateInput(targetAt, true)
  if (Number.isNaN(target.getTime())) {
    return {
      expired: true,
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      display: "00:00:00"
    }
  }

  // 倒计时不允许出现负数，因此先把剩余秒数裁到 0。
  const rest = Math.max(0, getRemainingSeconds(target))
  const hours = Math.floor(rest / 3600)
  const minutes = Math.floor((rest % 3600) / 60)
  const seconds = rest % 60

  return {
    expired: rest <= 0,
    totalSeconds: rest,
    hours,
    minutes,
    seconds,
    display: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
}

export function getChinaTimezoneOffsetMs(): number {
  // 暴露给业务层时只返回固定东八区偏移，避免页面自己硬编码 8 小时。
  return CHINA_OFFSET_MS
}
