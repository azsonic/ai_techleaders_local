import { CircleAlertIcon } from "lucide-react";

import { cn } from "../../lib/utils";

export function ErrorMessage({
  title = "Something went wrong",
  message,
  className,
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex gap-2 text-sm text-destructive", className)}>
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        {message && <p className="text-destructive/80">{message}</p>}
      </div>
    </div>
  );
}
