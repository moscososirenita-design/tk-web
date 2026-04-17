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
      return "border-red-100/90 from-red-500 via-red-600 to-red-700 shadow-red-600/40"
    case "blue":
      return "border-blue-100/90 from-blue-500 via-blue-600 to-blue-700 shadow-blue-600/40"
    default:
      return "border-green-100/90 from-green-500 via-green-600 to-green-700 shadow-green-600/40"
  }
}

export function getLotteryBallOutlineClass(num: number, explicitLabel?: string | null): string {
  switch (getLotteryBallColor(num, explicitLabel)) {
    case "red":
      return "border-red-400 text-red-600 shadow-red-600/10"
    case "blue":
      return "border-blue-400 text-blue-600 shadow-blue-600/10"
    default:
      return "border-green-400 text-green-600 shadow-green-600/10"
  }
}
