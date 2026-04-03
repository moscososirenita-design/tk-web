export type LotteryBallColor = "red" | "blue" | "green"

const redNumbers = new Set([1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46])
const blueNumbers = new Set([3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48])

function normalizeColorLabel(raw?: string | null): LotteryBallColor | null {
  const value = String(raw || "").trim().toLowerCase()
  if (!value) return null

  if (["red", "red_wave", "redwave", "red-ball", "redball", "hong", "hongbo", "红", "紅", "红波", "紅波"].includes(value)) {
    return "red"
  }
  if (["blue", "blue_wave", "bluewave", "blue-ball", "blueball", "lan", "lanbo", "蓝", "藍", "蓝波", "藍波"].includes(value)) {
    return "blue"
  }
  if (["green", "green_wave", "greenwave", "green-ball", "greenball", "lv", "lvbo", "绿", "綠", "绿波", "綠波"].includes(value)) {
    return "green"
  }

  return null
}

export function getLotteryBallColor(num: number, explicitLabel?: string | null): LotteryBallColor {
  const normalized = normalizeColorLabel(explicitLabel)
  if (normalized) return normalized

  const value = Number(num)
  if (redNumbers.has(value)) return "red"
  if (blueNumbers.has(value)) return "blue"
  return "green"
}

export function getLotteryBallFilledClass(num: number, explicitLabel?: string | null): string {
  switch (getLotteryBallColor(num, explicitLabel)) {
    case "red":
      return "border-rose-100/90 from-rose-400 via-pink-500 to-orange-500 shadow-rose-500/35"
    case "blue":
      return "border-sky-100/90 from-sky-400 via-cyan-500 to-blue-600 shadow-sky-500/35"
    default:
      return "border-emerald-100/90 from-emerald-400 via-teal-500 to-green-600 shadow-emerald-500/35"
  }
}

export function getLotteryBallOutlineClass(num: number, explicitLabel?: string | null): string {
  switch (getLotteryBallColor(num, explicitLabel)) {
    case "red":
      return "border-rose-300 text-rose-500 shadow-rose-500/10"
    case "blue":
      return "border-blue-300 text-blue-500 shadow-blue-500/10"
    default:
      return "border-emerald-300 text-emerald-500 shadow-emerald-500/10"
  }
}
