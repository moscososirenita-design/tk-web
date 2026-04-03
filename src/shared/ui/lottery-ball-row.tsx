import type { DisplayLotteryBall, DisplayLotteryBallGroup } from "@/src/shared/utils/lottery-record"
import { getLotteryBallFilledClass } from "@/src/shared/utils/lottery-ball"
import { cn } from "@/lib/utils"

type LotteryBallRowSize = "compact" | "default" | "large"

interface LotteryBallRowProps {
  balls: DisplayLotteryBallGroup
  size?: LotteryBallRowSize
  className?: string
  rowClassName?: string
  interactive?: boolean
}

interface LotteryBallSizeConfig {
  itemClassName: string
  surfaceClassName: string
  numberClassName: string
  labelClassName: string
  plusClassName: string
}

const sizeClassMap: Record<LotteryBallRowSize, LotteryBallSizeConfig> = {
  // compact 用在详情页关联开奖记录这种密度更高的小型号码区。
  compact: {
    itemClassName: "flex min-w-0 flex-1 basis-0 flex-col items-center",
    surfaceClassName:
      "max-w-[42px] shadow-lg md:max-w-[46px]",
    numberClassName: "text-[15px] md:text-[17px]",
    labelClassName: "mt-2 text-[10px]",
    plusClassName: "min-w-[10px] pt-1 text-xs",
  },
  // default 用在开奖历史列表，移动端尽量大，桌面端保持适中。
  default: {
    itemClassName: "flex min-w-0 flex-1 basis-0 flex-col items-center md:min-w-[64px] md:flex-none",
    surfaceClassName:
      "max-w-[46px] shadow-xl md:h-14 md:w-14 md:max-w-none",
    numberClassName: "text-[17px] md:text-[22px]",
    labelClassName: "mt-2 text-[11px] md:mt-0 md:text-xs",
    plusClassName: "min-w-[7px] pt-1 text-[14px] md:min-w-[28px] md:pt-4 md:text-2xl",
  },
  // large 统一给开奖现场和详情页主摘要卡使用，保证视觉重量一致。
  large: {
    itemClassName: "flex min-w-0 flex-1 basis-0 flex-col items-center md:min-w-[64px] md:flex-none",
    surfaceClassName:
      "max-w-[48px] shadow-xl md:h-[68px] md:w-[68px] md:max-w-none lg:h-[76px] lg:w-[76px]",
    numberClassName: "text-[18px] md:text-[28px] lg:text-[30px]",
    labelClassName: "mt-2 text-[11px] md:mt-2.5 md:text-[15px] lg:text-base",
    plusClassName: "min-w-[7px] pt-1 text-[14px] md:min-w-[32px] md:pt-5 md:text-[34px]",
  },
}

interface LotteryBallItemProps {
  ball: DisplayLotteryBall
  config: LotteryBallSizeConfig
  interactive: boolean
}

function LotteryBallItem({ ball, config, interactive }: LotteryBallItemProps) {
  return (
    <div className={config.itemClassName}>
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-full border bg-gradient-to-br text-white",
          config.surfaceClassName,
          interactive && "transition-all duration-300 group-hover:scale-[1.04]",
          getLotteryBallFilledClass(Number(ball.num), ball.colorLabel)
        )}
      >
        <span className={cn("font-mono font-black leading-none text-white", config.numberClassName)}>{ball.num}</span>
      </div>
      <span
        className={cn(
          "w-full text-center font-black leading-[1.15] tracking-[0.01em] text-muted-foreground",
          config.labelClassName
        )}
      >
        {ball.label}
      </span>
    </div>
  )
}

export function LotteryBallRow({
  balls,
  size = "default",
  className,
  rowClassName,
  interactive = false,
}: LotteryBallRowProps) {
  const config = sizeClassMap[size]

  return (
    <div className={cn("overflow-hidden pb-0.5", className)}>
      <div className={cn("flex w-full min-w-0 items-start justify-between gap-0", rowClassName)}>
        {balls.normals.map((ball, index) => (
          <LotteryBallItem
            key={`normal-${ball.num}-${index}`}
            ball={ball}
            config={config}
            interactive={interactive}
          />
        ))}

        {balls.bonus ? (
          <>
            <div
              className={cn(
                "flex shrink-0 items-center justify-center font-medium text-muted-foreground",
                config.plusClassName
              )}
            >
              +
            </div>
            <LotteryBallItem ball={balls.bonus} config={config} interactive={interactive} />
          </>
        ) : null}
      </div>
    </div>
  )
}
