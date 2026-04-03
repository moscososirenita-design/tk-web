// 共享 API 类型放在这里，避免每个业务模块重复声明通用响应结构。
// ApiEnvelope 兼容后端常见的 code/msg/data 包裹格式。
export interface ApiEnvelope<T = unknown> {
  code?: number
  msg?: string
  data?: T
  error?: string
}

// APIErrorShape 用于创建统一错误对象，兼容业务码、HTTP 状态码和原始详情。
export interface APIErrorShape {
  code?: number
  message: string
  status?: number
  details?: unknown
}

export class APIError extends Error {
  code?: number
  status?: number
  details?: unknown

  constructor(input: APIErrorShape) {
    super(input.message)
    // name 固定成 APIError，方便统一用 instanceof 做错误分流。
    this.name = "APIError"
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}
