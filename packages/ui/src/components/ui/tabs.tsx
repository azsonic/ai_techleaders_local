"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "../../lib/utils";

/*
 * Tabs switch between views of the same object on one page. One flat underline style: the active tab has a
 * 2px bar and semibold text, so it never relies on color alone (WCAG 1.4.1). No pill, no fill (A01, R01.3).
 * Arrow keys select the tab at once: panels render without delay (WAI-ARIA tabs, automatic activation).
 */
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={cn("flex flex-col gap-between-groups", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus
      className={cn(
        "flex w-full gap-between-groups overflow-x-auto border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px inline-flex min-h-control-dense shrink-0 items-center border-b-2 border-transparent px-inline text-interface whitespace-nowrap text-muted-foreground transition-colors select-none hover:text-foreground focus-ring disabled:cursor-not-allowed disabled:text-muted-foreground data-active:border-foreground data-active:font-emphasis data-active:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-interface focus-ring", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
