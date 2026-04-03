"use client"

import { useEffect, useRef } from "react"

// SwipeBackGesture 为 H5 提供“左边缘右滑返回上一级”手势。
// 只在移动端粗指针设备启用，并且只在左边缘起手时生效，尽量减少误触。
export function SwipeBackGesture() {
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startTimeRef = useRef(0)
  const trackingRef = useRef(false)
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(pointer: coarse)").matches) return

    const edgeWidth = 28
    const minDistance = 72
    const maxVerticalOffset = 56
    const maxDuration = 800

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        trackingRef.current = false
        return
      }
      const touch = event.touches[0]
      if (touch.clientX > edgeWidth) {
        trackingRef.current = false
        return
      }
      trackingRef.current = true
      triggeredRef.current = false
      startXRef.current = touch.clientX
      startYRef.current = touch.clientY
      startTimeRef.current = Date.now()
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!trackingRef.current || triggeredRef.current || event.touches.length !== 1) return
      const touch = event.touches[0]
      const deltaX = touch.clientX - startXRef.current
      const deltaY = Math.abs(touch.clientY - startYRef.current)
      const elapsed = Date.now() - startTimeRef.current
      if (deltaX >= minDistance && deltaY <= maxVerticalOffset && elapsed <= maxDuration) {
        triggeredRef.current = true
        trackingRef.current = false
        if (window.history.length > 1) {
          window.history.back()
        }
      }
    }

    const onTouchEnd = () => {
      trackingRef.current = false
      triggeredRef.current = false
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [])

  return null
}
