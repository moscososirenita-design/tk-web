// 认证接口层：只封装与登录、注册、短信验证码相关的 HTTP 请求。
import { http } from "@/src/shared/api/http"
import type {
  AuthResult,
  LoginByPasswordPayload,
  LoginBySMSPayload,
  RegisterPayload,
  SMSCodePayload,
  SMSCodeResult,
  UserProfile
} from "@/src/features/auth/model/types"

export const authAPI = {
  sendSMSCode(payload: SMSCodePayload): Promise<SMSCodeResult> {
    // 验证码发送统一走 public 接口，方便登录/注册页直接复用。
    return http.post<SMSCodeResult>("/public/user/auth/sms-code", payload)
  },

  loginByPassword(payload: LoginByPasswordPayload): Promise<AuthResult> {
    // 密码登录返回完整会话信息，调用侧再决定是否落本地存储。
    return http.post<AuthResult>("/public/user/auth/login/password", payload)
  },

  loginBySMS(payload: LoginBySMSPayload): Promise<AuthResult> {
    // 短信登录和密码登录返回结构保持一致，页面切换方式时不用改后续流程。
    return http.post<AuthResult>("/public/user/auth/login/sms", payload)
  },

  registerByPhone(payload: RegisterPayload): Promise<AuthResult> {
    // 注册成功后直接复用 AuthResult，让新用户首登流程更顺滑。
    return http.post<AuthResult>("/public/user/auth/register", payload)
  },

  refreshToken(refreshToken: string): Promise<AuthResult> {
    return http.post<AuthResult>("/public/user/auth/refresh", { refresh_token: refreshToken })
  },

  logout(accessToken: string): Promise<{ logged_out: boolean }> {
    return http.post<{ logged_out: boolean }>("/public/user/auth/logout", { access_token: accessToken })
  },

  profile(token?: string): Promise<UserProfile> {
    // profile 支持显式传 token，方便刷新页面时先带旧 token 做一次恢复校验。
    return http.get<UserProfile>("/public/user/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
  }
}
