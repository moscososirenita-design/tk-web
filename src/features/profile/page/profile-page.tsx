"use client"

// 个人中心页承载登录、注册、权益引导和用户资料入口，是用户域的统一主页面。
import { useEffect, useMemo, useState } from "react"
import { Gift, Loader2, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react"
import { Button } from "@/components/ui/actions/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card"
import { Input } from "@/components/ui/forms/input"
import { useAuth } from "@/src/features/auth/hooks/use-auth"
import { profileSocialAPI, type SocialUserItem } from "@/src/features/profile/api/profile-social-api"
import { Footer } from "@/src/shared/layout/footer"
import { Header } from "@/src/shared/layout/header"
import { MobileNav } from "@/src/shared/layout/mobile-nav"
import { isValidPassword, isValidPhone, isValidSMSCode, safeTrim } from "@/src/shared/security/validate"

type AuthMode = "login" | "register"
type LoginMethod = "password" | "sms"
type SocialTab = "followers" | "following"

// FeatureCard 用于登录卡片下方的引导权益区。
interface FeatureCard {
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

const featureCards: FeatureCard[] = [
  {
    title: "专业预测",
    subtitle: "AI智能分析",
    icon: Sparkles,
  },
  {
    title: "高手跟单",
    subtitle: "准确率85%+",
    icon: Trophy,
  },
  {
    title: "新人礼包",
    subtitle: "注册送100元",
    icon: Gift,
  },
  {
    title: "社区交流",
    subtitle: "万人在线",
    icon: ShieldCheck,
  },
]

export function ProfilePage() {
  const auth = useAuth()
  const [mode, setMode] = useState<AuthMode>("login")
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")
  const [rememberLogin, setRememberLogin] = useState(true)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [smsCode, setSMSCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [tip, setTip] = useState("")
  const [smsCooldown, setSMSCooldown] = useState(0)

  const [socialTab, setSocialTab] = useState<SocialTab>("followers")
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialError, setSocialError] = useState("")
  const [followers, setFollowers] = useState<SocialUserItem[]>([])
  const [following, setFollowing] = useState<SocialUserItem[]>([])

  const title = useMemo(() => (mode === "login" ? "登录您的账户" : "创建新账户"), [mode])

  useEffect(() => {
    if (smsCooldown <= 0) return
    const timer = window.setInterval(() => {
      setSMSCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [smsCooldown])

  useEffect(() => {
    const userID = Number(auth.profile?.id || 0)
    if (!auth.isLoggedIn || userID <= 0) return

    const loadSocial = async () => {
      setSocialLoading(true)
      setSocialError("")
      try {
        const [followersResp, followingResp] = await Promise.all([
          profileSocialAPI.followers(userID, { limit: 50, offset: 0 }),
          profileSocialAPI.following(userID, { limit: 50, offset: 0 }),
        ])
        setFollowers(followersResp.items || [])
        setFollowing(followingResp.items || [])
      } catch (error) {
        setSocialError(error instanceof Error ? error.message : "关注数据加载失败")
      } finally {
        setSocialLoading(false)
      }
    }

    void loadSocial()
  }, [auth.isLoggedIn, auth.profile?.id])

  const sendSMSCode = async () => {
    if (smsCooldown > 0) return

    const nextPhone = safeTrim(phone, 16)
    if (!isValidPhone(nextPhone)) {
      setTip("请输入正确手机号")
      return
    }

    try {
      const purpose = mode === "register" ? "register" : "login"
      const result = await auth.sendSMSCode({
        phone: nextPhone,
        purpose,
      })
      setSMSCooldown(60)
      setTip(result.mock_mode ? `验证码已发送（测试：${result.preview_code || "******"}）` : "验证码已发送")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "验证码发送失败")
    }
  }

  const submit = async () => {
    const nextPhone = safeTrim(phone, 16)
    if (!isValidPhone(nextPhone)) {
      setTip("请输入正确手机号")
      return
    }

    try {
      if (mode === "login") {
        if (loginMethod === "password") {
          if (!isValidPassword(password)) {
            setTip("密码长度需要 6-64 位")
            return
          }
          await auth.loginByPassword({
            phone: nextPhone,
            password: safeTrim(password, 64),
          })
        } else {
          if (!isValidSMSCode(smsCode)) {
            setTip("请输入 6 位验证码")
            return
          }
          await auth.loginBySMS({
            phone: nextPhone,
            sms_code: safeTrim(smsCode, 6),
          })
        }
      } else {
        if (!isValidSMSCode(smsCode)) {
          setTip("请输入 6 位验证码")
          return
        }
        if (!isValidPassword(password)) {
          setTip("密码长度需要 6-64 位")
          return
        }
        await auth.registerByPhone({
          phone: nextPhone,
          sms_code: safeTrim(smsCode, 6),
          password: safeTrim(password, 64),
          nickname: safeTrim(nickname, 64),
        })
      }

      await auth.fetchProfile()
      setTip("操作成功")
    } catch (error) {
      setTip(error instanceof Error ? error.message : "操作失败")
    }
  }

  const socialItems = socialTab === "followers" ? followers : following

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-8 lg:px-8">
        {!auth.isLoggedIn ? (
          <section className="mx-auto max-w-md">
            <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/90 p-6 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.85)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/35 bg-primary/10">
                <UserRound className="h-7 w-7 text-primary" />
              </div>

              <div className="mt-5 space-y-1 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              </div>

              <div className="mt-7 space-y-4">
                {mode === "login" ? (
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/30 p-1">
                    <button
                      type="button"
                      className={`rounded-lg py-2 text-sm transition ${
                        loginMethod === "password" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                      onClick={() => setLoginMethod("password")}
                    >
                      密码登录
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg py-2 text-sm transition ${
                        loginMethod === "sms" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                      onClick={() => setLoginMethod("sms")}
                    >
                      验证码登录
                    </button>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="auth-phone" className="text-sm font-medium text-foreground">
                    手机号
                  </label>
                  <Input
                    id="auth-phone"
                    autoComplete="username"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-12 border-border/70 bg-background/60"
                  />
                </div>

                {mode === "register" || loginMethod === "sms" ? (
                  <div className="space-y-2">
                    <label htmlFor="auth-sms" className="text-sm font-medium text-foreground">
                      验证码
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="auth-sms"
                        placeholder="请输入6位验证码"
                        value={smsCode}
                        onChange={(event) => setSMSCode(event.target.value)}
                        className="h-12 border-border/70 bg-background/60"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 shrink-0 border-primary/30 text-primary"
                        onClick={() => void sendSMSCode()}
                        disabled={smsCooldown > 0}
                      >
                        {smsCooldown > 0 ? `${smsCooldown}s` : "发送"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {mode === "register" || loginMethod === "password" ? (
                  <div className="space-y-2">
                    <label htmlFor="auth-password" className="text-sm font-medium text-foreground">
                      密码
                    </label>
                    <Input
                      id="auth-password"
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder={mode === "login" ? "请输入密码" : "设置登录密码"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 border-border/70 bg-background/60"
                    />
                  </div>
                ) : null}

                {mode === "register" ? (
                  <div className="space-y-2">
                    <label htmlFor="auth-nickname" className="text-sm font-medium text-foreground">
                      昵称（可选）
                    </label>
                    <Input
                      id="auth-nickname"
                      placeholder="设置展示昵称"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      className="h-12 border-border/70 bg-background/60"
                    />
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={rememberLogin}
                      onChange={(event) => setRememberLogin(event.target.checked)}
                      className="h-4 w-4 rounded border-border bg-background accent-primary"
                    />
                    记住登录
                  </label>
                  <button
                    type="button"
                    className="text-primary transition-colors hover:text-primary/80"
                    onClick={() => setTip("请联系在线客服重置密码")}
                  >
                    忘记密码?
                  </button>
                </div>

                <Button
                  className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                  disabled={auth.loading}
                  onClick={() => void submit()}
                >
                  {auth.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : mode === "login" ? (
                    "登录"
                  ) : (
                    "注册"
                  )}
                </Button>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border/70" />
                  <span>或者</span>
                  <span className="h-px flex-1 bg-border/70" />
                </div>

                <Button
                  variant="outline"
                  className="h-12 w-full border-border/80 bg-transparent text-base"
                  onClick={() => {
                    setTip("")
                    setMode((prev) => (prev === "login" ? "register" : "login"))
                    setLoginMethod("password")
                    setSMSCode("")
                    setPassword("")
                  }}
                >
                  {mode === "login" ? "注册新账户" : "返回登录"}
                </Button>

                {tip || auth.error ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    {tip || auth.error}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {featureCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-card/75 p-5 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.85)]"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            <Card className="border-border/60 bg-card/90">
              <CardHeader>
                <CardTitle>我的资料</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">昵称</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.nickname || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">用户名</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.username || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">手机号</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.phone || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">最后登录</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.last_login_at || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">我的等级</p>
                  <p className="mt-1 text-base font-semibold">
                    {auth.profile?.level ? `${auth.profile.level.level_name} (Lv.${auth.profile.level.level_no})` : "暂无等级"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">成长值</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.growth_value ?? 0}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">粉丝 / 关注</p>
                  <p className="mt-1 text-base font-semibold">
                    {auth.profile?.fans_count ?? 0} / {auth.profile?.following_count ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">升级还需成长值</p>
                  <p className="mt-1 text-base font-semibold">{auth.profile?.level?.next_need_growth ?? 0}</p>
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                  <Button variant="destructive" onClick={() => void auth.logout()}>
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90">
              <CardHeader>
                <CardTitle>粉丝与关注</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="inline-flex rounded-lg bg-secondary/30 p-1">
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                      socialTab === "followers" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                    onClick={() => setSocialTab("followers")}
                  >
                    粉丝 ({followers.length})
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                      socialTab === "following" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                    onClick={() => setSocialTab("following")}
                  >
                    关注 ({following.length})
                  </button>
                </div>

                {socialError ? <p className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">{socialError}</p> : null}

                {socialLoading ? (
                  <p className="text-sm text-muted-foreground">加载中...</p>
                ) : socialItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无数据</p>
                ) : (
                  <div className="space-y-2">
                    {socialItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/10 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-3">
                          {item.avatar ? (
                            <img src={item.avatar} alt={item.display_name || item.nickname || item.username} className="h-9 w-9 rounded-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">{(item.display_name || item.nickname || item.username || "U").slice(0, 1)}</div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{item.display_name || item.nickname || item.username}</p>
                            <p className="truncate text-xs text-muted-foreground">Lv.{item.level_no} · {item.level_name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">粉丝 {item.fans_count} · 关注 {item.following_count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
