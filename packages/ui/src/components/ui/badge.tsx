import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

/*
 * Status badge: text always says the status, color only supports it (WCAG 1.4.1). The current or active status
 * is the strongest treatment (R01.5). Rounded like a control, not a pill (A01).
 */
const badgeVariants = cva(
  "inline-flex min-h-control-min w-fit max-w-full shrink-0 items-center gap-inline rounded-control border border-transparent px-within-group text-interface wrap-anywhere [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary font-emphasis text-primary-foreground",
        secondary:
          "border-border bg-secondary font-body text-secondary-foreground",
        destructive:
          "border-destructive bg-card font-emphasis text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
