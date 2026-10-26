import * as React from "react";
import { cn } from "../../lib/utils";

import { useFieldControl } from "@devmentor/ui/components/ui/field-context";

/* The question to a mentor and written answers are conversation text (R02.1). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const control = useFieldControl();

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-control w-full rounded-control border border-input bg-card px-control-x py-within-group text-conversation text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground focus-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:hover:border-border",
        className,
      )}
      {...control}
      {...props}
    />
  );
}

export { Textarea };
