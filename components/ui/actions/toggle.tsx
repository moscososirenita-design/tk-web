'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Toggle variants mirror button semantics but add explicit on/off state styling.
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Toggle wraps Radix and keeps active state styling driven by data-state.
// ... existing code ...

/**
 * Toggle 组件 - 切换开关组件
 *
 * 基于 Radix UI Toggle 构建，支持显式的开/关状态样式。
 * 用于需要切换状态的场景，如工具栏按钮、选项开关等。
 *
 * @param className - 自定义类名，用于添加额外的样式类
 * @param variant - 切换按钮的变体，控制视觉风格
 *                  可选值：default(默认，透明背景), outline(带边框和阴影)
 * @param size - 切换按钮的尺寸
 *               可选值：default(默认), sm(小), lg(大)
 * @param props - 其他所有 TogglePrimitive.Root 组件的属性，包括 pressed、onPressedChange 等状态属性
 *
 * @returns 渲染后的 Toggle 组件，包含 data-slot 标识和基于 data-state 的状态样式
 */
function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// ... existing code ...


export { Toggle, toggleVariants }
