// 全局 HTTP 客户端：集中处理 baseURL、公共请求头、超时、错误包装与鉴权信息注入。
import { clearAuthSession, getAccessToken, getDeviceID, getRefreshToken, setAuthSession } from "@/src/shared/auth/storage"
import { APIError, type ApiEnvelope } from "@/src/shared/api/types"

interface RequestOptions {
  // params 统一走对象形式，方便 get/delete 等无 body 请求附带查询参数。
  params?: Record<string, string | number | boolean | null | undefined>
  // headers 允许业务接口局部覆盖默认请求头，例如临时带 token。
  headers?: HeadersInit
  // timeoutMs 允许个别重请求适当放宽超时时间。
  timeoutMs?: number
  // signal 用于把外部取消信号透传到 fetch。
  signal?: AbortSignal
  // cache 允许业务显式覆盖默认缓存策略。
  cache?: RequestCache
  // __retryAuth 为内部字段：标记该请求已经做过一次 token 刷新重试，避免死循环。
  __retryAuth?: boolean
}

const DEFAULT_TIMEOUT_MS = 10000
let refreshAccessPromise: Promise<string> | null = null
const AUTH_FREE_PATHS = [
  "/public/user/auth/sms-code",
  "/public/user/auth/login/password",
  "/public/user/auth/login/sms",
  "/public/user/auth/register",
  "/public/user/auth/refresh",
]

function createRequestID(): string {
  // 优先用浏览器原生 randomUUID，退回时再用时间戳 + 随机串拼接。
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getBaseURL(): string {
  // baseURL 支持从环境变量注入，未配置时默认回落到站内代理前缀。
  const env = process.env.NEXT_PUBLIC_API_BASE_URL
  const base = String(env || "/api/v1").trim()
  return base || "/api/v1"
}

function buildURL(path: string, params?: RequestOptions["params"]): string {
  // prefix 去掉末尾斜杠，避免 path 再次拼接时出现双斜杠。
  const prefix = getBaseURL().replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${prefix}${normalizedPath}`
  if (!params) return url

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    // null / undefined 直接跳过，避免查询串里出现无意义值。
    if (value === null || typeof value === "undefined") return
    query.set(key, String(value))
  })

  const suffix = query.toString()
  return suffix ? `${url}?${suffix}` : url
}

function normalizePath(path: string): string {
  const next = String(path || "").trim()
  if (!next) return "/"
  return next.startsWith("/") ? next : `/${next}`
}

async function parseResponseBody<T>(response: Response): Promise<T | ApiEnvelope<T>> {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    // JSON 响应优先按对象解析，交给 unwrapEnvelope 继续拆包。
    return (await response.json()) as T | ApiEnvelope<T>
  }

  // 非 JSON 响应（极少数文件/文本接口）直接按文本读取。
  const text = await response.text()
  return text as unknown as T
}

function unwrapEnvelope<T>(payload: T | ApiEnvelope<T>, status: number): T {
  if (payload && typeof payload === "object") {
    const envelope = payload as ApiEnvelope<T>

    if (typeof envelope.code === "number") {
      if (envelope.code === 0) {
        // code=0 视为业务成功；data 为空时回一个空对象，减少调用侧判空分支。
        return (envelope.data ?? ({} as T)) as T
      }

      throw new APIError({
        code: envelope.code,
        message: envelope.msg || envelope.error || "请求失败",
        status,
        details: payload
      })
    }

    if (
      Object.prototype.hasOwnProperty.call(envelope, "data") &&
      Object.keys(envelope).length === 1
    ) {
      // 兼容只包一层 data 的简化接口。
      return envelope.data as T
    }
  }

  // 既不是 envelope 结构，也不是异常结构时，视为接口直接返回业务数据。
  return payload as T
}

function shouldTryRefreshAuth(path: string, error: APIError, options: RequestOptions): boolean {
  if (typeof window === "undefined") return false
  if (options.__retryAuth) return false
  if (!getRefreshToken()) return false
  if (AUTH_FREE_PATHS.some((item) => normalizePath(path).startsWith(item))) return false

  const code = Number(error.code || 0)
  const status = Number(error.status || 0)
  const message = String(error.message || "").toLowerCase()

  if ([40025, 40101, 40102, 40103].includes(code)) return true
  if (status === 401 || status === 403) return true
  if (/access token|token invalid|token required|unauthor|expired|session/i.test(message)) return true

  return false
}

async function refreshAccessTokenOnce(): Promise<string> {
  if (typeof window === "undefined") return ""
  if (refreshAccessPromise) return refreshAccessPromise

  refreshAccessPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return ""

    try {
      const response = await fetch(buildURL("/public/user/auth/refresh"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Request-ID": createRequestID(),
          "X-Device-ID": getDeviceID(),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: "include",
        cache: "no-store",
      })

      const payload = await parseResponseBody<{
        access_token?: string
        refresh_token?: string
        user?: unknown
      }>(response)

      if (!response.ok) {
        clearAuthSession()
        return ""
      }

      const envelope = payload as ApiEnvelope<{
        access_token?: string
        refresh_token?: string
        user?: unknown
      }>
      const data = envelope?.code === 0 ? envelope.data : envelope?.data

      const access = String(data?.access_token || "").trim()
      const refresh = String(data?.refresh_token || "").trim()
      if (!access || !refresh) {
        clearAuthSession()
        return ""
      }

      setAuthSession({
        accessToken: access,
        refreshToken: refresh,
        userProfile: data?.user,
      })
      return access
    } catch {
      clearAuthSession()
      return ""
    } finally {
      refreshAccessPromise = null
    }
  })()

  return refreshAccessPromise
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  // 每次请求都创建独立 AbortController，统一处理超时与外部取消。
  const controller = new AbortController()
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeoutID = globalThis.setTimeout(() => controller.abort(), timeout)

  if (options.signal) {
    // 外部 signal 中断时，同步中止当前 controller，保证只有一套 abort 流程。
    options.signal.addEventListener("abort", () => controller.abort(), { once: true })
  }

  try {
    const headers = new Headers(options.headers)
    headers.set("Accept", "application/json")
    headers.set("X-Request-ID", createRequestID())

    if (typeof window !== "undefined") {
      // 只有浏览器环境才注入设备号与本地 token，SSR 阶段不触碰 localStorage。
      headers.set("X-Device-ID", getDeviceID())
      const token = getAccessToken()
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }

    const hasBody = typeof body !== "undefined" && body !== null
    if (hasBody && !headers.has("Content-Type")) {
      // 默认 body 按 JSON 提交；文件上传等特殊场景可以在外部自行覆盖 Content-Type。
      headers.set("Content-Type", "application/json")
    }

    // 开发环境下不再把所有 GET 都强制 no-store，否则本地每次切页/刷新都会丢掉浏览器缓存。
    // 生产环境仍保持实时接口默认 no-store，避免开奖数据被旧缓存污染。
    const resolvedCache: RequestCache =
      options.cache ??
      (method === "GET" && process.env.NODE_ENV === "development" ? "default" : "no-store")

    const response = await fetch(buildURL(path, options.params), {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      credentials: "include",
      cache: resolvedCache,
      signal: controller.signal
    })

    const payload = await parseResponseBody<T>(response)

    if (!response.ok) {
      // HTTP 层失败优先把后端 envelope 信息带进统一错误对象。
      const envelope = payload as ApiEnvelope<T>
      throw new APIError({
        code: envelope?.code,
        message: envelope?.msg || envelope?.error || `请求失败(${response.status})`,
        status: response.status,
        details: payload
      })
    }

    return unwrapEnvelope<T>(payload, response.status)
  } catch (error) {
    // APIError 场景下，优先尝试一次 refresh token 自动续期并重放请求。
    if (error instanceof APIError) {
      if (shouldTryRefreshAuth(path, error, options)) {
        const nextAccess = await refreshAccessTokenOnce()
        if (nextAccess) {
          const retryHeaders = new Headers(options.headers)
          retryHeaders.set("Authorization", `Bearer ${nextAccess}`)
          return request<T>(method, path, body, {
            ...options,
            headers: retryHeaders,
            __retryAuth: true,
          })
        }
      }
      throw error
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new APIError({ message: "请求超时，请稍后重试" })
    }
    // 其余未知错误统一折叠成用户可读的网络失败提示。
    throw new APIError({ message: error instanceof Error ? error.message : "网络请求失败" })
  } finally {
    // 不论请求成功或失败，都要清掉超时定时器，避免资源泄漏。
    globalThis.clearTimeout(timeoutID)
  }
}

export const http = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    // GET/DELETE 默认没有 body，统一传 undefined。
    return request<T>("GET", path, undefined, options)
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options)
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options)
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options)
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options)
  }
}
