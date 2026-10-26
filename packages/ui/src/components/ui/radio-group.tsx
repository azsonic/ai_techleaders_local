"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { useFieldControl } from "@devmentor/ui/components/ui/field-context"

import { cn } from "../../lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-within-group", className)}
      {...props}
    />
  )
}

/* The chosen option shows a dot inside the ring, so the choice is a shape, not only a color (tokens.md). */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  const control = useFieldControl()

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group relative flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-card transition-colors hover:border-foreground focus-ring after:absolute after:-inset-inline aria-invalid:border-destructive data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-muted data-disabled:hover:border-border",
        className
      )}
      {...control}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-primary group-data-disabled:bg-muted-foreground"
      />
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
