import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/*
 * Says why a place is empty and what to do next (title, one sentence, one action). Left aligned: nothing
 * is centered for effect. Two cases use this one component with different words: "nothing here yet"
 * (action: create) and "no results for these filters" (action: clear filters).
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-start gap-within-group rounded-panel border border-border bg-card p-panel",
        className,
      )}
    >
      <p className="text-conversation font-emphasis">{title}</p>
      {description && <p className="text-interface text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
