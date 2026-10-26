"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { useFieldControl } from "@devmentor/ui/components/ui/field-context";

import { cn } from "../../lib/utils";

/*
 * The box is 20px and extends its hit area to 28px; the label makes the whole row the target (WCAG 2.5.8).
 * Checked shows a check mark and indeterminate a dash: state never relies on fill alone (tokens.md).
 */
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  const control = useFieldControl();

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox relative flex size-5 shrink-0 items-center justify-center rounded-sm border border-input bg-card transition-colors hover:border-foreground focus-ring after:absolute after:-inset-inline aria-invalid:border-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:aria-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:border-border data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:hover:border-border",
        className,
      )}
      {...control}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <CheckIcon
          className="size-3.5 group-data-indeterminate/checkbox:hidden"
          aria-hidden
        />
        <MinusIcon
          className="hidden size-3.5 group-data-indeterminate/checkbox:block"
          aria-hidden
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
