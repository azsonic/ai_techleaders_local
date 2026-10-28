"use client";

import { CheckIcon } from "lucide-react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { EmptyState } from "../../backend/feedback/empty-state";
import { ErrorMessage } from "../../backend/feedback/error-message";
import { LoadingMessage } from "../../backend/feedback/loading-message";
import { useViewerZone } from "../../hooks/use-viewer-zone";
import type { PreviewSlot } from "../availability/slot-preview";
import { formatDay, formatTime } from "../availability/windows";
import { Skeleton } from "../ui/skeleton";
import { zoneName } from "./local-time";

/*
 * Slots grouped by day for the chosen length (E02-S02). One radio group: arrow keys move between slots, so sixty slots
 * are one tab stop, not sixty. The chosen slot shows a check and a heavier border (never color alone). Times use the
 * viewer's zone, written out once above the list.
 */
export function SlotPicker({
  slots,
  minutes,
  value,
  onValueChange,
  zone,
  loading = false,
  error = false,
}: {
  slots: PreviewSlot[] | undefined;
  minutes: 25 | 50;
  /** The chosen slot's start, as a UTC ISO string. */
  value?: string;
  onValueChange?: (startsAt: string) => void;
  zone?: string;
  loading?: boolean;
  error?: boolean;
}) {
  const viewerZone = useViewerZone(zone);

  if (loading) {
    return (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Loading slots…" />
        <Skeleton aria-hidden className="h-control w-full" />
      </div>
    );
  }
  if (error || !slots) {
    return (
      <ErrorMessage
        title="Slots did not load"
        message="Nothing was booked. Reload the page to see them."
      />
    );
  }

  const fitting = slots.filter((slot) => minutes === 25 || slot.fiftyFits);
  if (fitting.length === 0) {
    return (
      <EmptyState
        title={`No ${minutes}-minute slots in the next 14 days`}
        description={
          minutes === 50
            ? "Try the 25-minute length, or look at another mentor."
            : "Look at another mentor."
        }
      />
    );
  }

  const days = new Map<string, PreviewSlot[]>();
  for (const slot of fitting) {
    const day = formatDay(slot.startsAt, viewerZone);
    days.set(day, [...(days.get(day) ?? []), slot]);
  }

  return (
    <div className="flex flex-col gap-between-groups">
      <p className="text-interface text-muted-foreground">
        Times are in {viewerZone} ({zoneName(fitting[0].startsAt, viewerZone)}).
      </p>
      <RadioGroupPrimitive
        aria-label="Start time"
        value={value ?? ""}
        onValueChange={(next) => onValueChange?.(next as string)}
        className="flex flex-col gap-between-groups"
      >
        {[...days].map(([day, daySlots]) => (
          <div
            key={day}
            role="group"
            aria-label={day}
            className="flex flex-col gap-within-group"
          >
            <h3 className="text-interface font-emphasis">{day}</h3>
            <div className="flex flex-wrap gap-within-group">
              {daySlots.map((slot) => (
                <RadioPrimitive.Root
                  key={slot.startsAt}
                  value={slot.startsAt}
                  className="inline-flex h-control-dense items-center gap-inline rounded-control border border-border bg-card px-control-x-dense text-interface transition-colors hover:border-foreground focus-ring data-checked:border-foreground data-checked:font-emphasis"
                >
                  <RadioPrimitive.Indicator
                    keepMounted={false}
                    className="inline-flex"
                  >
                    <CheckIcon aria-hidden className="size-3.5" />
                  </RadioPrimitive.Indicator>
                  {formatTime(slot.startsAt, viewerZone)}
                </RadioPrimitive.Root>
              ))}
            </div>
          </div>
        ))}
      </RadioGroupPrimitive>
    </div>
  );
}
