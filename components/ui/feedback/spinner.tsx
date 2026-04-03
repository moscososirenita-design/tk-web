import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

// Shared loading spinner based on Lucide's loader icon.
// Centralizing it keeps aria labeling and animation treatment consistent.
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
