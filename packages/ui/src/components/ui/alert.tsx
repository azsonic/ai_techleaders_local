import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlertIcon, InfoIcon } from "lucide-react"

import { cn } from "../../lib/utils"

/*
 * Inline message beside the content it concerns. It always carries an icon and a title, so meaning never
 * rests on color (WCAG 1.4.1). Opaque and bordered, no shadow (A01.2). It is not dismissible and not a toast.
 */
const alertVariants = cva(
  "grid w-full grid-cols-[auto_1fr] gap-x-within-group gap-y-inline rounded-panel border bg-card p-panel text-left text-interface",
  {
    variants: {
      variant: {
        default: "border-border text-card-foreground",
        destructive: "border-destructive text-card-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({
  className,
  variant = "default",
  children,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const Icon = variant === "destructive" ? CircleAlertIcon : InfoIcon

  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon
        aria-hidden
        className={cn(
          "row-span-2 size-4 translate-y-0.5",
          variant === "destructive" ? "text-destructive" : "text-foreground"
        )}
      />
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-emphasis", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
