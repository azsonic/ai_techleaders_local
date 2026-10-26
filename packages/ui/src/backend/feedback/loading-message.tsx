import { cn } from "../../lib/utils";

/* Plain status text. No spinner and no motion: a loading state is announced, not decorated (P11.1). */
export function LoadingMessage({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <p role="status" className={cn("text-interface text-muted-foreground", className)}>
      {label}
    </p>
  );
}
