import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

import { useFieldControl } from "@devmentor/ui/components/ui/field-context";

/* Typed text is conversation text (R02.1); dense inputs follow the browsing size (R01.1). Boundary: R01.3, WCAG 1.4.11. */
const inputVariants = cva(
  "w-full min-w-0 rounded-control border border-input bg-card text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground focus-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:hover:border-border",
  {
    variants: {
      density: {
        default: "h-control px-control-x text-conversation",
        dense: "h-control-dense px-control-x-dense text-interface",
      },
    },
    defaultVariants: { density: "default" },
  },
);

function Input({
  className,
  type,
  density,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  const control = useFieldControl();

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ density }), className)}
      {...control}
      {...props}
    />
  );
}

export { Input, inputVariants };
