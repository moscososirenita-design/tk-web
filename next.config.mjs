/** @type {import('next').NextConfig} */
const proxyTarget = String(process.env.API_PROXY_TARGET || "http://127.0.0.1:8088").replace(/\/$/, "")

const nextConfig = {
  poweredByHeader: false,
  // 开发态左下角的 N 图标来自 Next.js dev indicator，不属于业务 UI。
  // 这里直接关掉，避免干扰页面验收。
  devIndicators: false,
  experimental: {
    // 项目里大量使用 lucide-react，开发态按需拆分能减少页面重编译时的图标包开销。
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${proxyTarget}/api/:path*`
      },
      {
        source: "/ws/:path*",
        destination: `${proxyTarget}/ws/:path*`
      }
    ]
  },
  async headers() {
    const scriptSrcParts = ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"]
    if (process.env.NODE_ENV !== "production") {
      scriptSrcParts.push("'unsafe-eval'")
    }

    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-site" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          `script-src ${scriptSrcParts.join(" ")}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' data: blob: https:",
          "connect-src 'self' https: ws: wss:",
          "font-src 'self' data:",
          "object-src 'none'",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join("; ")
      }
    ]

    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
