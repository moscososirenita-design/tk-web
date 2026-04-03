// 输入安全工具：提供最基础的裁剪、清洗与字段合法性判断。
const PHONE_REGEXP = /^1\d{10}$/

export function safeTrim(value: unknown, maxLength = 512): string {
  // 所有字符串输入先转成 string 再裁剪，减少 null/number 等值带来的分支复杂度。
  return String(value ?? "").trim().slice(0, maxLength)
}

export function isValidPhone(phone: string): boolean {
  // 手机号先裁剪，再做规则校验，避免前后空格导致的误判。
  return PHONE_REGEXP.test(safeTrim(phone, 32))
}

export function isValidSMSCode(code: string): boolean {
  // 当前验证码规则固定为 6 位数字。
  return /^\d{6}$/.test(safeTrim(code, 8))
}

export function isValidPassword(password: string): boolean {
  // 密码规则先做长度兜底，复杂度策略后续可继续扩展。
  const normalized = String(password || "")
  return normalized.length >= 6 && normalized.length <= 64
}

export function safeKeyword(value: unknown): string {
  // 关键字场景直接去掉最常见的 HTML 注入字符，适合作为轻量搜索入参清洗。
  return safeTrim(value, 32).replace(/[<>"']/g, "")
}

export function safeInt(value: unknown, fallback = 0): number {
  // 数字解析失败时直接回退，避免 NaN 继续流入业务层。
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}
