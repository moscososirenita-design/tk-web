// 存储工具层：统一管理 accessToken、refreshToken、设备号等本地持久化信息。
// AuthSession 是前端本地持久化会话的标准结构。
export interface AuthSession {
  accessToken: string
  refreshToken: string
  userProfile?: unknown
}

export const AUTH_STORAGE_KEYS = {
  accessToken: "tk_web_token",
  refreshToken: "tk_web_refresh_token",
  profile: "tk_web_user_profile",
  deviceID: "tk_web_device_id"
} as const

function hasWindow(): boolean {
  // 所有 localStorage 读写前都要先过这层判断，避免 SSR 直接报错。
  return typeof window !== "undefined"
}

export function getDeviceID(): string {
  // 服务端渲染阶段不生成真实设备号，只返回一个稳定占位值。
  if (!hasWindow()) return "server-device"

  const cached = window.localStorage.getItem(AUTH_STORAGE_KEYS.deviceID)
  if (cached) return cached

  // 设备号第一次访问时生成并缓存，后续请求头保持一致。
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem(AUTH_STORAGE_KEYS.deviceID, next)
  return next
}

export function getAccessToken(): string {
  // access token 读取失败时统一回空串，减少调用侧空值分支判断。
  if (!hasWindow()) return ""
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) || ""
}

export function getRefreshToken(): string {
  // refresh token 与 access token 保持相同返回约定。
  if (!hasWindow()) return ""
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) || ""
}

export function setAuthSession(session: AuthSession): void {
  if (!hasWindow()) return

  if (session.accessToken) {
    // 有值时直接覆盖旧 token，保证刷新登录后本地会话即时生效。
    window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken)
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
  }

  if (session.refreshToken) {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken)
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
  }

  if (typeof session.userProfile !== "undefined") {
    // profile 统一序列化后存储，避免各页面自己定义 key 和结构。
    window.localStorage.setItem(AUTH_STORAGE_KEYS.profile, JSON.stringify(session.userProfile))
  }
}

export function clearAuthSession(): void {
  // 退出登录时只清理会话相关 key，不动 deviceID，保证设备标识可持续复用。
  if (!hasWindow()) return
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.profile)
}

export function getStoredProfile<T>(): T | null {
  if (!hasWindow()) return null
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.profile)
  if (!raw) return null
  try {
    // 读取失败时回 null，而不是抛出异常中断页面初始化。
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
