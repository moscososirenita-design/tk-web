import { cn } from '@/lib/utils'

// Skeleton is intentionally minimal so callers control the final size/shape via className.
// This keeps loading placeholders flexible for cards, avatars, rows, and charts.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
