import type { ComponentProps } from "react"

import { cn } from "../../lib/utils"

/* A static placeholder for content that is loading. It does not pulse or shimmer (P11.1). */
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("rounded-control bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
