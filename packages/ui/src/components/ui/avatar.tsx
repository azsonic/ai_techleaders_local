"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { getInitials } from "../../lib/initials"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-control border border-border bg-muted text-foreground select-none",
  {
    variants: {
      size: {
        xs: "size-control-min",
        default: "size-control-dense",
        lg: "size-control",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type AvatarProps = AvatarPrimitive.Root.Props &
  VariantProps<typeof avatarVariants> & {
    /** Full display name. Shown as initials when there is no image, and used as the image description. */
    name: string
    /** Image address. Without one, or while it fails to load, the initials are shown. */
    src?: string
    /** Set when the name is already written next to the avatar, so screen readers do not hear it twice. */
    decorative?: boolean
  }

/** Person marker for mentor cards and message attribution (R02.3). Initials are text, not a drawn symbol. */
function Avatar({ className, size, name, src, decorative = false, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {src && <AvatarPrimitive.Image data-slot="avatar-image" src={src} alt="" className="size-full object-cover" />}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        className="flex size-full items-center justify-center text-interface font-emphasis"
      >
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export { Avatar, avatarVariants }
export type { AvatarProps }
