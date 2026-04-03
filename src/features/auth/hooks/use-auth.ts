"use client"

// 认证 hook 统一封装登录、注册、短信验证码与本地登录态同步逻辑。
import { useCallback, useEffect, useMemo, useState } from "react"
import { authAPI } from "@/src/features/auth/api/auth-api"
import type {
  AuthResult,
  LoginByPasswordPayload,
  LoginBySMSPayload,
  RegisterPayload,
  SMSCodePayload,
  SMSCodeResult,
  UserProfile
} from "@/src/features/auth/model/types"
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredProfile,
  setAuthSession
} from "@/src/shared/auth/storage"

export function useAuth() {
  const [accessToken, setAccessToken] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // 首次挂载时尝试从本地恢复会话，让刷新页面后仍能保留登录态。
    setAccessToken(getAccessToken())
    setRefreshToken(getRefreshToken())
    setProfile(getStoredProfile<UserProfile>())
  }, [])

  const applyAuthResult = useCallback((result: AuthResult) => {
    // 所有认证成功后的状态落地都集中在这里，避免登录/注册分散重复代码。
    const access = result.access_token || ""
    const refresh = result.refresh_token || ""
    const userProfile = result.user || null

    setAccessToken(access)
    setRefreshToken(refresh)
    setProfile(userProfile)
    setAuthSession({
      accessToken: access,
      refreshToken: refresh,
      userProfile
    })
  }, [])

  const sendSMSCode = useCallback(async (payload: SMSCodePayload): Promise<SMSCodeResult> => {
    // 发送验证码不进 loading，避免影响整个登录表单的其他交互。
    setError("")
    return authAPI.sendSMSCode(payload)
  }, [])

  const loginByPassword = useCallback(
    async (payload: LoginByPasswordPayload): Promise<AuthResult> => {
      // 登录前先清理旧错误，防止用户修正输入后仍看到旧报错。
      setLoading(true)
      setError("")
      try {
        const result = await authAPI.loginByPassword(payload)
        applyAuthResult(result)
        return result
      } catch (error) {
        // 页面展示友好文案，但原始错误继续往外抛，方便调用侧决定是否 toast。
        const nextError = error instanceof Error ? error.message : "登录失败"
        setError(nextError)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [applyAuthResult]
  )

  const loginBySMS = useCallback(
    async (payload: LoginBySMSPayload): Promise<AuthResult> => {
      setLoading(true)
      setError("")
      try {
        const result = await authAPI.loginBySMS(payload)
        applyAuthResult(result)
        return result
      } catch (error) {
        const nextError = error instanceof Error ? error.message : "登录失败"
        setError(nextError)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [applyAuthResult]
  )

  const registerByPhone = useCallback(
    async (payload: RegisterPayload): Promise<AuthResult> => {
      setLoading(true)
      setError("")
      try {
        const result = await authAPI.registerByPhone(payload)
        applyAuthResult(result)
        return result
      } catch (error) {
        const nextError = error instanceof Error ? error.message : "注册失败"
        setError(nextError)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [applyAuthResult]
  )

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    const token = getAccessToken()
    if (!token) {
      // 没 token 时直接把 profile 清空，避免界面继续展示脏资料。
      setProfile(null)
      return null
    }

    setLoading(true)
    setError("")
    try {
      const nextProfile = await authAPI.profile(token)
      setProfile(nextProfile)
      setAuthSession({
        accessToken: token,
        refreshToken: getRefreshToken(),
        userProfile: nextProfile
      })
      return nextProfile
    } catch (error) {
      // profile 拉取失败时优先尝试 refresh token 续期，失败再清空本地会话。
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          const refreshed = await authAPI.refreshToken(refresh)
          applyAuthResult(refreshed)
          return refreshed.user || null
        } catch {
          // refresh 失败时继续执行下方兜底清理。
        }
      }

      const nextError = error instanceof Error ? error.message : "获取用户资料失败"
      setError(nextError)
      clearAuthSession()
      setAccessToken("")
      setRefreshToken("")
      setProfile(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [applyAuthResult])

  const logout = useCallback(async () => {
    // 退出登录优先通知后端失效会话，失败时也保证前端本地会话一定被清理。
    const token = getAccessToken()
    try {
      if (token) {
        await authAPI.logout(token)
      }
    } catch {
      // 后端退出失败不阻塞前端会话清理。
    } finally {
      clearAuthSession()
      setAccessToken("")
      setRefreshToken("")
      setProfile(null)
      setError("")
    }
  }, [])

  const isLoggedIn = useMemo(() => Boolean(accessToken), [accessToken])

  return {
    accessToken,
    refreshToken,
    profile,
    loading,
    error,
    isLoggedIn,
    sendSMSCode,
    loginByPassword,
    loginBySMS,
    registerByPhone,
    fetchProfile,
    logout
  }
}
