"use client";

import { useState } from "react";

import type { ApiErrorBody, ApiResult } from "@devmentor/core";

import { EmptyState } from "../../backend/feedback/empty-state";
import { ErrorMessage } from "../../backend/feedback/error-message";
import { LoadingMessage } from "../../backend/feedback/loading-message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ZONE, formatDay, formatTime } from "./windows";

export type AvailabilityWindow = {
  id: string;
  startsAt: string;
  endsAt: string;
};

const describe = ({ startsAt, endsAt }: AvailabilityWindow) =>
  `${formatDay(startsAt)}, ${formatTime(startsAt)} to ${formatTime(endsAt)}`;

type WindowListProps = {
  windows: AvailabilityWindow[] | undefined;
  /** True while the list is first requested. */
  loading?: boolean;
  /** Set when the list could not be loaded. */
  error?: boolean;
  onRetry?: () => void;
  /** Removes one window on the server. The dialog stays open until it resolves. */
  onRemove: (id: string) => Promise<ApiResult<unknown>>;
};

/*
 * The mentor's upcoming windows with a remove action. Removing is the deletion confirmation pattern: the window is
 * named in the question, Cancel comes first and the button says "Remove window", not OK (D24, WCAG 3.3.4).
 */
export function WindowList({
  windows,
  loading = false,
  error = false,
  onRetry,
  onRemove,
}: WindowListProps) {
  const [target, setTarget] = useState<AvailabilityWindow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [failure, setFailure] = useState<ApiErrorBody | null>(null);

  const close = () => {
    setTarget(null);
    setFailure(null);
  };

  const confirm = async (window: AvailabilityWindow) => {
    setRemoving(true);
    setFailure(null);
    const result = await onRemove(window.id);
    setRemoving(false);
    if (result.ok) setTarget(null);
    else setFailure(result.error);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Loading your windows…" />
        <div aria-hidden className="flex flex-col gap-within-group">
          <Skeleton className="h-control-dense w-full" />
          <Skeleton className="h-control-dense w-full" />
        </div>
      </div>
    );
  }

  if (error || !windows) {
    return (
      <ErrorMessage
        title="Your windows did not load"
        message="Nothing was changed. Try again."
        action={
          onRetry && (
            <Button variant="secondary" size="dense" onClick={onRetry}>
              Try again
            </Button>
          )
        }
      />
    );
  }

  if (windows.length === 0) {
    return (
      <EmptyState
        title="No windows yet"
        description={`Add a window above. Mentees can book only inside the windows you publish, in ${ZONE} time.`}
      />
    );
  }

  return (
    <>
      <ul
        aria-label="Upcoming windows"
        className="flex flex-col border-y border-border"
      >
        {windows.map((window) => (
          <li
            key={window.id}
            className="flex flex-wrap items-center justify-between gap-within-group border-b border-border py-within-group text-interface last:border-b-0"
          >
            <span className="font-emphasis">{describe(window)}</span>
            <Button
              variant="secondary"
              size="dense"
              aria-label={`Remove window ${describe(window)}`}
              onClick={() => setTarget(window)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>

      <AlertDialog
        open={target !== null}
        onOpenChange={(open) => !open && !removing && close()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {target ? `Remove ${describe(target)}?` : "Remove window?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Mentees can no longer book this window. A session that is already
              booked is not cancelled by this.
            </AlertDialogDescription>
            {failure && (
              <Alert variant="destructive">
                <AlertTitle>The window was not removed</AlertTitle>
                <AlertDescription>
                  {failure.code === "network_error"
                    ? "The server did not answer. Check your connection and try again."
                    : failure.message}
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep window</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              loading={removing}
              loadingLabel="Removing…"
              onClick={() => confirm(target as AvailabilityWindow)}
            >
              Remove window
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
