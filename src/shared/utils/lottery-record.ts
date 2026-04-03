// 彩票记录展示工具：统一把号码、标签和波色整理成页面层可直接消费的结构。

export interface DisplayLotteryBall {
  num: string
  label: string
  colorLabel?: string
}

export interface DisplayLotteryBallGroup {
  normals: DisplayLotteryBall[]
  bonus: DisplayLotteryBall | null
}

export function buildDisplayLotteryBalls(
  numbers: number[] | undefined,
  labels: string[] | undefined,
  colorLabels?: string[] | undefined
): DisplayLotteryBallGroup {
  // 同一期开奖结果里的号码、标签和波色一律按索引对齐。
  const items = (numbers || []).map((num, index) => ({
    num: String(num).padStart(2, "0"),
    label: String(labels?.[index] || "-").trim() || "-",
    colorLabel: colorLabels?.[index],
  }))

  // 没有数据时返回标准空结构，避免页面层反复判空。
  if (items.length === 0) {
    return { normals: [], bonus: null }
  }

  return {
    // 六合彩类玩法默认最后一位是特别号。
    normals: items.slice(0, Math.max(0, items.length - 1)),
    bonus: items[items.length - 1] || null,
  }
}
