"use client"

import type { CSSProperties } from "react"
import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize2, Radio, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import type { DashboardData } from "@/src/features/home/model/types"
import { formatDateTime, getCurrentDrawCycleSeconds, toCountdown } from "@/src/shared/utils/date"
import { cn } from "@/lib/utils"

interface LiveStreamProps {
  dashboard?: DashboardData | null
  activeTabName?: string
  className?: string
  fillHeight?: boolean
}

const LIVE_PREVIEW_WINDOW_SECONDS = 5 * 60
const LIVE_PLAYBACK_KEEP_SECONDS = 30 * 60

const orbitDisk = {
  // 单圆盘轨道：统一一层圆形轨道，不再做内外双环，画面更稳。
  duration: 14,
  size: "clamp(132px, 35vw, 196px)",
  radius: "clamp(48px, 12.5vw, 76px)",
  container: "clamp(152px, 40vw, 224px)",
  ballSize: "clamp(34px, 9.2vw, 50px)",
  centerSize: "clamp(48px, 13vw, 68px)",
  centerIconSize: "clamp(20px, 5.5vw, 32px)",
  angles: [-90, -28, 34, 96, 158, 220],
  numbers: [47, 33, 3, 12, 25, 18],
} as const

// The live panel only needs the time portion here, so we trim date noise if present.
function formatDrawTime(raw: string | undefined): string {
  if (!raw) {
    return "--:--:--"
  }

  const formatted = formatDateTime(raw)
  if (formatted === "-") {
    return "--:--:--"
  }

  return formatted.split(" ")[1] || formatted
}

export function LiveStream({ dashboard, activeTabName, className, fillHeight = false }: LiveStreamProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false)
  const [countdownDisplay, setCountdownDisplay] = useState("00:00:00")
  const [hasPlaybackEnded, setHasPlaybackEnded] = useState(false)

  useEffect(() => {
    const syncFullscreenState = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null }
      const fullscreenElement = doc.fullscreenElement || doc.webkitFullscreenElement || null
      // 浏览器全屏状态和页面内伪全屏状态分开记录，按钮文案才能保持准确。
      setIsBrowserFullscreen(fullscreenElement === containerRef.current)
    }

    syncFullscreenState()
    document.addEventListener("fullscreenchange", syncFullscreenState)
    document.addEventListener("webkitfullscreenchange", syncFullscreenState as EventListener)

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState)
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!isPseudoFullscreen) {
      return
    }

    // 伪全屏时锁住 body 滚动，避免背景页面继续滚动造成错位感。
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isPseudoFullscreen])

  // 倒计时统一以彩种配置页的“下期开奖时间”作为锚点，不再退回到当前期开奖时间。
  const nextDrawAt = dashboard?.special_lottery?.next_draw_at || ""
  const streamURL = dashboard?.live?.stream_url || ""

  useEffect(() => {
    // 切换到新的开奖周期或新的播放源时，清空“已播完”状态，让下一轮直播还能正常出现。
    setHasPlaybackEnded(false)
  }, [nextDrawAt, streamURL])

  useEffect(() => {
    const syncCountdown = () => {
      // 直播区的核心信息就是“距开奖还有多久”，因此独立每秒刷新一次。
      setCountdownDisplay(toCountdown(nextDrawAt).display)
    }

    syncCountdown()
    const interval = setInterval(syncCountdown, 1000)
    return () => clearInterval(interval)
  }, [nextDrawAt])

  const hasLiveStream = Boolean(streamURL)
  const isExpanded = isBrowserFullscreen || isPseudoFullscreen
  const cycleSeconds = getCurrentDrawCycleSeconds(nextDrawAt)
  const isCountdownStage = Number.isFinite(cycleSeconds) && cycleSeconds > 0 && cycleSeconds <= LIVE_PREVIEW_WINDOW_SECONDS
  const isPlaybackStage = Number.isFinite(cycleSeconds) && cycleSeconds <= 0 && cycleSeconds >= -LIVE_PLAYBACK_KEEP_SECONDS
  const shouldPlayStream = isPlaybackStage && hasLiveStream && !hasPlaybackEnded
  // 直播区只在两种情况下显示：
  // 1. 开奖前 5 分钟的预告阶段；
  // 2. 真正进入播放阶段且视频还没播完。
  // 视频播完后整块直播区一起隐藏，不再残留底部信息条。
  const shouldRenderPanel = isCountdownStage || shouldPlayStream
  const streamSubline = isCountdownStage ? `开奖时间 ${formatDrawTime(nextDrawAt)}` : `${activeTabName || dashboard?.special_lottery?.name || "彩种"} 直播进行中`
  const countdownSegments = countdownDisplay.split(":")

  if (!shouldRenderPanel) {
    return null
  }

  const toggleFullscreen = async () => {
    const element = containerRef.current as
      | (HTMLDivElement & {
          webkitRequestFullscreen?: () => Promise<void> | void
          msRequestFullscreen?: () => Promise<void> | void
        })
      | null

    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void
      webkitFullscreenElement?: Element | null
      msExitFullscreen?: () => Promise<void> | void
    }

    if (!element) {
      return
    }

    if (isExpanded) {
      // 已在浏览器全屏时优先退出浏览器全屏，否则退回页面内伪全屏。
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
      }
      setIsPseudoFullscreen(false)
      return
    }

    try {
      // 先尝试原生全屏，浏览器拒绝时再降级到伪全屏。
      if (element.requestFullscreen) {
        await element.requestFullscreen()
        return
      }
      if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
        return
      }
      if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
        return
      }
    } catch {
      // Fall back to a viewport overlay mode when the browser blocks fullscreen.
    }

    setIsPseudoFullscreen(true)
  }

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card",
        fillHeight && "lg:h-full",
        isPseudoFullscreen && "fixed inset-4 z-50 rounded-2xl shadow-2xl shadow-black/30",
        className
      )}
      style={
        isExpanded
          ? { height: isPseudoFullscreen ? "calc(100vh - 2rem)" : "100%" }
          : undefined
      }
    >
      {/* Live Badge */}
      <div className="absolute left-3 top-3 z-20 flex items-center gap-3 md:left-4 md:top-4">
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-lg md:gap-2 md:px-3 md:py-1.5", isCountdownStage ? "bg-amber-500" : "bg-red-600")}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[11px] font-bold text-white md:text-xs">{isCountdownStage ? "即将开播" : "直播中"}</span>
        </div>
      </div>

      {/* Video Container */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          isExpanded ? "min-h-0 flex-1" : "aspect-video"
        )}
      >
        {/* 当前直播区先用轨道球动效承接视觉；
            后续若改成真实视频流，只需要替换这一层内容，不动外层控制栏。 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 中心辉光把视线先引到开奖号码轨道中心。 */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
          
          {/* 网格底纹只负责增强科技感，不承载真实信息。 */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          {/* 单圆盘轨道：号码球围绕一层圆盘旋转，不再出现多层同心环。 */}
          <div className="absolute inset-0 box-border flex items-center justify-center px-3 pb-14 pt-6 md:px-6 md:pb-20 md:pt-6">
            <div className="flex max-w-full flex-col items-center gap-2 md:gap-3">
              <div
                className="relative shrink-0"
                style={
                  {
                    width: orbitDisk.container,
                    height: orbitDisk.container,
                    ["--tk-orbit-size" as string]: orbitDisk.size,
                    ["--tk-orbit-radius" as string]: orbitDisk.radius,
                    ["--tk-orbit-ball-size" as string]: orbitDisk.ballSize,
                    ["--tk-orbit-center-size" as string]: orbitDisk.centerSize,
                    ["--tk-orbit-center-icon-size" as string]: orbitDisk.centerIconSize,
                  } as CSSProperties
                }
              >
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-3xl md:h-36 md:w-36" />

                <div
                  // 单圆盘轨道只做一层，减少“同心圆过多”带来的视觉噪音。
                  className="absolute left-1/2 top-1/2 rounded-full border border-white/8 bg-white/[0.015] shadow-[inset_0_0_26px_rgba(255,255,255,0.018)]"
                  style={{
                    width: "var(--tk-orbit-size)",
                    height: "var(--tk-orbit-size)",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: "var(--tk-orbit-size)",
                    height: "var(--tk-orbit-size)",
                    transform: "translate(-50%, -50%)",
                    willChange: "transform",
                    animationName: "tk-orbit-spin",
                    animationDuration: `${orbitDisk.duration}s`,
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite",
                  }}
                >
                  {orbitDisk.numbers.map((num, index) => (
                    <div
                      key={`single-disk-${num}`}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${orbitDisk.angles[index]}deg) translateY(calc(var(--tk-orbit-radius) * -1))`,
                      }}
                    >
                      <div
                        className="relative flex aspect-square items-center justify-center rounded-full border border-white/14 bg-gradient-to-br from-primary via-primary to-primary/75 shadow-[0_14px_28px_rgba(0,0,0,0.24),0_0_24px_color-mix(in_oklch,var(--primary)_30%,transparent)] ring-1 ring-white/10"
                        style={{
                          width: "var(--tk-orbit-ball-size)",
                          height: "var(--tk-orbit-ball-size)",
                          willChange: "transform",
                          animationName: "tk-counter-spin",
                          animationDuration: `${orbitDisk.duration}s`,
                          animationTimingFunction: "linear",
                          animationIterationCount: "infinite",
                          animationDirection: "reverse",
                        }}
                      >
                        <div className="absolute inset-x-2 top-1.5 h-4 rounded-full bg-white/14 blur-[1px]" />
                        <div className="absolute inset-[2px] rounded-full border border-white/10" />
                        <span className="relative text-base font-black tracking-tight text-primary-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] md:text-lg">
                          {String(num).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/16 bg-slate-950/34 shadow-[0_0_36px_rgba(15,23,42,0.45)] backdrop-blur-md"
                  style={{
                    width: "var(--tk-orbit-center-size)",
                    height: "var(--tk-orbit-center-size)",
                  }}
                >
                  {/* Radio 图标固定在轨道中心，承担“直播核心信号源”的视觉角色。 */}
                  <Radio
                    className="text-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.12)]"
                    style={{
                      width: "var(--tk-orbit-center-icon-size)",
                      height: "var(--tk-orbit-center-icon-size)",
                    }}
                  />
                </div>
              </div>
              
              {/* 文字信息固定放到球阵下方，只保留倒计时和开奖时间。 */}
              <div className="hidden max-w-full flex-col items-center md:flex" aria-live="polite">
                {/* 进入 5 分钟临界区后，用高对比分段倒计时替代固定时间。 */}
                <div className="flex items-center gap-1 rounded-[20px] border border-primary/25 bg-black/45 px-2.5 py-1.5 shadow-[0_0_30px_rgba(0,0,0,0.18)] backdrop-blur-sm md:gap-1.5 md:px-3 md:py-2">
                  {countdownSegments.map((part, index) => (
                    <div key={`${part}-${index}`} className="flex items-center gap-1 md:gap-1.5">
                      <span className="inline-flex min-w-[40px] justify-center rounded-2xl bg-gradient-to-b from-white/16 to-white/6 px-2 py-1.5 font-mono text-base font-black tracking-[0.12em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:min-w-[60px] md:px-3 md:py-2 md:text-2xl">
                        {part}
                      </span>
                      {index < countdownSegments.length - 1 ? (
                        <span className="pb-0.5 font-mono text-base font-black text-primary md:text-2xl">:</span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 rounded-full bg-black/42 px-3 py-1 text-center text-[11px] text-white/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.85)] md:mt-2 md:px-4 md:text-base">
                  {streamSubline}
                </p>
              </div>
            </div>
          </div>
        </div>

        {shouldPlayStream ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            controls={false}
            muted={isMuted}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setHasPlaybackEnded(true)}
          >
            <source src={streamURL} />
          </video>
        ) : null}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-primary/20 hover:text-white md:h-9 md:w-9"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-primary/20 hover:text-white md:h-9 md:w-9"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              
              {/* 进度条只保留一个轻提示，避免和正式视频画面争抢注意力。 */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <div className="h-1 w-32 rounded-full bg-white/30 overflow-hidden">
                  <div className={cn("h-full w-full", isCountdownStage ? "bg-amber-400 animate-pulse" : "bg-primary")} />
                </div>
                <span className="text-xs text-white/80">{isCountdownStage ? "等待开奖" : "直播中"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs text-white/80 mr-2">
                  {activeTabName || dashboard?.special_lottery?.name || "开奖直播"}
                </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-primary/20 hover:text-white md:h-9 md:w-9"
                onClick={() => void toggleFullscreen()}
              >
                {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info Bar */}
      <div className="flex items-center justify-between border-t border-border/50 bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {(activeTabName || dashboard?.special_lottery?.name || "彩种")} 开奖直播
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {streamSubline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            设置提醒
          </Button>
          <Button size="sm" className="text-xs bg-primary text-primary-foreground">
            分享直播
          </Button>
        </div>
      </div>
    </section>
  )
}
