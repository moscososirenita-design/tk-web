import * as React from 'react'

// H5 模式同时覆盖手机和常见竖屏平板，因此断点放宽到 1024。
// 这样像 768 / 820 这类设备不会再误落到“桌面布局”里。
const MOBILE_BREAKPOINT = 1024

// useIsMobile centralizes viewport width detection for components that need
// mobile-specific interaction models, such as sheets or bottom navigation.
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // matchMedia lets us react to viewport changes without wiring custom resize listeners.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Return a strict boolean so callers do not need to handle an initial undefined state.
  return !!isMobile
}
