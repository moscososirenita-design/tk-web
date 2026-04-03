# app 目录说明

`app` 是 Next.js App Router 的路由入口层。

这里的文件应该尽量保持轻量，只做三件事：

1. 声明路由入口，例如 `/`、`/forum`、`/history`
2. 在少数需要的地方接收动态路由参数，例如 `/forum/[id]`
3. 提供根布局能力，例如 `layout.tsx` 中的字体、全局样式、主题 Provider

不建议把复杂页面逻辑、接口请求、状态管理直接写在 `app` 目录里。
这些实现统一下沉到 `src/features/*` 或 `src/shared/*` 中，方便按业务维护。
