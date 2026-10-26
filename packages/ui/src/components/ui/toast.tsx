"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheckIcon, XIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

/*
 * Toast: a short confirmation that the server accepted something ("Availability saved"). It is a status
 * message, announced politely, and it carries an icon and a title so meaning never rests on color
 * (WCAG 1.4.1, 4.1.3). It pauses while hovered or focused and has a close button. It has no animation
 * and no stacking effect (P11.1). An error that needs action is never a toast: use an Alert or a field error.
 */
const useToast = ToastPrimitive.useToastManager;

/** Dismissal delay in ms. A proposal (no reference): long enough to read two short lines. */
const TOAST_TIMEOUT = 8000;

function ToastList({ className }: { className?: string }) {
  const { toasts } = useToast();

  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      aria-label="Notifications"
      className={cn(
        "fixed inset-x-between-groups bottom-between-groups z-50 flex flex-col gap-within-group sm:left-auto sm:w-80",
        className,
      )}
    >
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          toast={toast}
          data-slot="toast"
          className="relative grid grid-cols-[auto_1fr] gap-x-within-group gap-y-inline rounded-panel border border-border bg-card p-panel pr-section text-left text-interface text-card-foreground data-limited:hidden"
        >
          <CircleCheckIcon
            aria-hidden
            className="row-span-2 size-4 translate-y-0.5"
          />
          <ToastPrimitive.Title
            data-slot="toast-title"
            className="col-start-2 font-emphasis"
          />
          <ToastPrimitive.Description
            data-slot="toast-description"
            className="col-start-2 text-muted-foreground empty:hidden"
          />
          <ToastPrimitive.Close
            data-slot="toast-close"
            aria-label="Close notification"
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-within-group right-within-group"
              />
            }
          >
            <XIcon aria-hidden />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
    </ToastPrimitive.Viewport>
  );
}

/** Mount once near the root of a page. Call `useToast().add({ title, description })` from any child. */
function ToastProvider({
  children,
  timeout = TOAST_TIMEOUT,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastPrimitive.Provider timeout={timeout} {...props}>
      {children}
      <ToastList />
    </ToastPrimitive.Provider>
  );
}

export { TOAST_TIMEOUT, ToastProvider, useToast };
