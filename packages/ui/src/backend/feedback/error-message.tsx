import type { ReactNode } from "react";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "../../lib/utils";

/*
 * Error state: what happened and what to do, in place of content that could not load. The icon repeats the
 * words and is never the only cue (WCAG 1.4.1). Offer the next step in `action`, for example a retry.
 */
export function ErrorMessage({
  title = "Something went wrong",
  message,
  action,
  className,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" data-slot="error-message" className={cn("flex gap-within-group text-interface", className)}>
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="flex flex-col items-start gap-within-group">
        <p className="font-emphasis text-destructive">{title}</p>
        {message && <p className="text-foreground">{message}</p>}
        {action}
      </div>
    </div>
  );
}
