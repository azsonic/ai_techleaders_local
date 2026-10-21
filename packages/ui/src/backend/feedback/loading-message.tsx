import { Loader2Icon } from "lucide-react";

import { cn } from "../../lib/utils";

export function LoadingMessage({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <p role="status" className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      {label}
    </p>
  );
}
