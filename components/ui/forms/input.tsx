// Input 是最基础的文本输入框包装，集中维护边框、聚焦、错误和文件输入的样式。
import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // 第一段负责输入框本体排版、占位符和禁用态。
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // 第二段负责聚焦时的 ring 与边框反馈。
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          // 第三段把无障碍错误态和表单校验态统一映射到 destructive 色系。
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
