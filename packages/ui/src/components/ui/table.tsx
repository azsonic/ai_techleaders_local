"use client";

import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

/*
 * Dense data table (R01.1, R01.3): thin 1px row separators, interface-size text, rows at least 32px high.
 * The container scrolls sideways on narrow screens and is reachable by keyboard (WCAG 2.1.1), so it needs a name.
 */
function Table({
  className,
  label,
  ...props
}: ComponentProps<"table"> & {
  /** Names the scrollable region, for example "Invitations". */
  label: string;
}) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className="relative w-full overflow-x-auto rounded-panel focus-ring"
    >
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-interface", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-border bg-muted font-emphasis", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border hover:bg-accent [tbody>&:last-child]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

/** Column and row headers. Defaults to a column header; pass scope="row" for a row header. */
function TableHead({
  className,
  scope = "col",
  ...props
}: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      className={cn(
        "h-control-dense px-within-group text-left align-middle font-emphasis whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("h-control-dense px-within-group align-middle", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "pb-within-group text-left text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
