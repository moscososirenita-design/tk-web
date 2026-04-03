import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Button variants define the project's shared action language.
// Product pages should prefer extending these variants instead of inventing ad-hoc buttons.

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:border-primary/35 hover:bg-primary/10 hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-primary/15',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Button can render as a native button or pass styles into another element via Slot.
// This keeps links, dialog triggers, and custom controls visually consistent.
// ... existing code ...

/**
 * Button 组件 - 项目统一的基础按钮组件
 *
 * 支持多种变体和尺寸，可渲染为原生 button 元素或通过 Slot 渲染为其他组件。
 * 用于保持整个项目的按钮样式一致性，适用于各种交互场景。
 *
 * @param className - 自定义类名，用于添加额外的样式类
 * @param variant - 按钮变体，控制按钮的颜色和风格主题
 *                  可选值：default(默认), destructive(破坏性), outline(边框),
 *                         secondary(次要), ghost(幽灵), link(链接)
 * @param size - 按钮尺寸，控制按钮的大小和内边距
 *               可选值：default(默认), sm(小), lg(大), icon(图标),
 *                      icon-sm(小图标), icon-lg(大图标)
 * @param asChild - 是否作为子组件渲染，当为 true 时使用 Slot 组件包裹子元素，
 *                  允许将按钮样式传递给其他组件（如 Link、DialogTrigger 等）
 * @param props - 其他所有 button 元素的属性
 *
 * @returns 渲染后的 Button 组件，根据 asChild 属性决定渲染为原生 button 或 Slot
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // 根据 asChild 属性动态选择组件类型：true 时使用 Slot 实现子组件代理，false 时使用原生 button 标签
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// ... existing code ...


export { Button, buttonVariants }
