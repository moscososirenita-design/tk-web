'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

// Thin wrapper around Radix AspectRatio so the rest of the project
// can use a unified `data-slot` hook and shared typing style.
// Pages usually place media or cards inside it to preserve layout before assets load.
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
