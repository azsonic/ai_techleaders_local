import { EmptyState } from "../../backend/feedback/empty-state";
import { ErrorMessage } from "../../backend/feedback/error-message";
import { LoadingMessage } from "../../backend/feedback/loading-message";
import { Skeleton } from "../ui/skeleton";
import { ZONE, formatDay, formatTime } from "./windows";

export type PreviewSlot = {
  /** Start of the 25-minute slot, as a UTC ISO string. */
  startsAt: string;
  /** True when two consecutive steps fit, so a 50-minute session can start here (E01 spec). */
  fiftyFits: boolean;
};

/*
 * What a mentee would be offered, computed by the server from the mentor's windows (R08: nothing starting within two
 * hours, a 25-minute grid, 50 minutes only when two steps fit). It is a preview, so it never has an action.
 */
export function SlotPreview({
  slots,
  loading = false,
  error = false,
}: {
  slots: PreviewSlot[] | undefined;
  loading?: boolean;
  error?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Calculating bookable slots…" />
        <Skeleton aria-hidden className="h-control w-full" />
      </div>
    );
  }
  if (error || !slots) {
    return (
      <ErrorMessage
        title="The preview did not load"
        message="Your windows are safe. Reload the page to see it."
      />
    );
  }
  if (slots.length === 0) {
    return (
      <EmptyState
        title="No bookable slots yet"
        description="A slot must start at least two hours from now and fit inside a window. Add a longer or later window."
      />
    );
  }

  const days = new Map<string, PreviewSlot[]>();
  for (const slot of slots) {
    const day = formatDay(slot.startsAt);
    days.set(day, [...(days.get(day) ?? []), slot]);
  }

  return (
    <div className="flex flex-col gap-between-groups">
      <p className="text-interface text-muted-foreground">
        Times are in {ZONE}. Bold times also allow a 50-minute session.
      </p>
      {[...days].map(([day, daySlots]) => (
        <section
          key={day}
          aria-label={day}
          className="flex flex-col gap-within-group"
        >
          <h3 className="text-interface font-emphasis">{day}</h3>
          <ul className="flex flex-wrap gap-within-group">
            {daySlots.map((slot) => (
              <li
                key={slot.startsAt}
                className={
                  slot.fiftyFits
                    ? "rounded-control border border-foreground px-within-group py-inline text-interface font-emphasis"
                    : "rounded-control border border-border px-within-group py-inline text-interface"
                }
              >
                {formatTime(slot.startsAt)}
                {slot.fiftyFits && (
                  <span className="sr-only"> (50 minutes also fits)</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
