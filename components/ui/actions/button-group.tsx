import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/display/separator'

// Button group variants mainly control how sibling button borders and radii collapse together.
const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

// Group exposes role="group" so assistive tech understands these controls are related.
// ... existing code ...

/**
 * ButtonGroup 组件 - 按钮组容器组件
 *
 * 用于将多个相关按钮组合在一起，形成一个视觉和语义上的整体。
 * 支持水平和垂直两种排列方向，自动处理相邻按钮的边框和圆角折叠。
 *
 * @param className - 自定义类名，用于添加额外的样式类
 * @param orientation - 按钮组的排列方向
 *                      可选值：horizontal(水平排列，默认), vertical(垂直排列)
 *                      水平排列时相邻按钮共享垂直边框，垂直排列时共享水平边框
 * @param props - 其他所有 div 元素的属性
 *
 * @returns 渲染后的 ButtonGroup 容器组件，包含 role="group" 无障碍属性
 */
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

// ... existing code ...


// Text block is useful when a label or prefix needs to visually match adjacent buttons.
// ... existing code ...

/**
 * ButtonGroupText 组件 - 按钮组文本标签组件
 *
 * 用于在按钮组中显示文本标签或前缀，样式与相邻按钮保持一致。
 * 支持通过 asChild 属性将样式传递给其他组件，实现灵活的组合使用。
 *
 * @param className - 自定义类名，用于添加额外的样式类
 * @param asChild - 是否作为子组件渲染，当为 true 时使用 Slot 组件包裹子元素，
 *                  允许将样式传递给其他组件（如 label、span 等）
 * @param props - 其他所有 div 元素的属性
 *
 * @returns 渲染后的 ButtonGroupText 组件，根据 asChild 属性决定渲染为原生 div 或 Slot
 */
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
}) {
  // 根据 asChild 属性动态选择组件类型：true 时使用 Slot 实现子组件代理，false 时使用原生 div 标签
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

// ... existing code ...


// Separator gives grouped controls an optional internal divider without leaving the group layout.
// ... existing code ...

/**
 * ButtonGroupSeparator 组件 - 按钮组分隔符组件
 *
 * 用于在按钮组内部提供可选的内部分隔线，无需离开组布局即可实现视觉分隔。
 * 基于 Separator 组件构建，自动适配按钮组的布局和方向。
 *
 * @param className - 自定义类名，用于添加额外的样式类
 * @param orientation - 分隔符的方向，默认为 'vertical'
 *                      可选值：vertical(垂直方向), horizontal(水平方向)
 *                      垂直分隔符用于水平排列的按钮组，水平分隔符用于垂直排列的按钮组
 * @param props - 其他所有 Separator 组件的属性
 *
 * @returns 渲染后的 ButtonGroupSeparator 分隔符组件，包含 data-slot 标识和无障碍属性
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  )
}

// ... existing code ...


export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
