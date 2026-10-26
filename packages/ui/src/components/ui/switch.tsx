"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { useFieldControl } from "@devmentor/ui/components/ui/field-context"

import { cn } from "../../lib/utils"

/*
 * Track 24px high. The thumb sits left when off and right when on, so the state is a position, not only a
 * color, and nothing animates (P11.1). Write the setting in the label, for example "Listed in the directory".
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  const control = useFieldControl()

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group relative flex h-control-min w-control shrink-0 items-center justify-start rounded-control border border-input bg-muted p-inline transition-colors hover:border-foreground focus-ring after:absolute after:-inset-inline aria-invalid:border-destructive data-checked:justify-end data-checked:border-primary data-checked:bg-primary data-checked:hover:bg-primary-hover data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-muted data-disabled:hover:border-border",
        className
      )}
      {...control}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3 rounded-sm bg-foreground data-checked:bg-primary-foreground group-data-disabled:bg-muted-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
