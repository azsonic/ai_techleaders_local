"use client";

import { EmptyState } from "../../backend/feedback/empty-state";
import { ErrorMessage } from "../../backend/feedback/error-message";
import { LoadingMessage } from "../../backend/feedback/loading-message";
import { BookingClosedNotice } from "../bookings/booking-closed-notice";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { MentorCard, MentorCardSkeleton } from "./mentor-card";
import { STACKS, type Stack } from "./pricing";

export type DirectoryMentor = {
  id: string;
  displayName: string;
  stacks: Stack[];
  priceFrom: number | null;
  nearestSlot: string | null;
  href: string;
};

/*
 * The directory (E02-S01) and the filtered list pattern: visible stack filters that one click removes, a result count
 * that is announced, and two different empty states, "nothing here yet" and "no results for these filters" (with a
 * clear action). The server filters; this component shows the result. No ratings (N02).
 */
export function MentorDirectory({
  mentors,
  selected,
  onSelectedChange,
  loading = false,
  error = false,
  onRetry,
  bookingClosed = false,
}: {
  mentors: DirectoryMentor[] | undefined;
  selected: Stack[];
  onSelectedChange: (selected: Stack[]) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** Paid booking is closed: the list stays public and a notice replaces any booking prompt (D31). */
  bookingClosed?: boolean;
}) {
  const clear = () => onSelectedChange([]);

  return (
    <div className="flex flex-col gap-between-groups">
      {bookingClosed && <BookingClosedNotice />}

      <FieldSet>
        <FieldLegend>Stack</FieldLegend>
        <div className="flex flex-wrap gap-x-between-groups gap-y-within-group">
          {STACKS.map((stack) => (
            <Field key={stack.value} orientation="horizontal" className="w-fit">
              <Checkbox
                checked={selected.includes(stack.value)}
                onCheckedChange={(checked) =>
                  onSelectedChange(
                    checked
                      ? [...selected, stack.value]
                      : selected.filter((value) => value !== stack.value),
                  )
                }
              />
              <FieldLabel>{stack.label}</FieldLabel>
            </Field>
          ))}
        </div>
        {selected.length > 0 && (
          <div>
            <Button variant="link" onClick={clear}>
              Clear filters
            </Button>
          </div>
        )}
      </FieldSet>

      {loading && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading mentors…" />
          <div className="grid gap-between-groups md:grid-cols-2">
            <MentorCardSkeleton />
            <MentorCardSkeleton />
          </div>
        </div>
      )}

      {!loading && (error || !mentors) && (
        <ErrorMessage
          title="Mentors did not load"
          message="Nothing was changed. Try again."
          action={
            onRetry && (
              <Button variant="secondary" size="dense" onClick={onRetry}>
                Try again
              </Button>
            )
          }
        />
      )}

      {!loading &&
        !error &&
        mentors &&
        mentors.length === 0 &&
        selected.length > 0 && (
          <EmptyState
            title="No mentors for these filters"
            description="Remove a filter to see more mentors."
            action={
              <Button variant="secondary" size="dense" onClick={clear}>
                Clear filters
              </Button>
            }
          />
        )}

      {!loading &&
        !error &&
        mentors &&
        mentors.length === 0 &&
        selected.length === 0 && (
          <EmptyState
            title="No mentors are listed yet"
            description="Mentors appear here once they publish prices and availability. Check back soon."
          />
        )}

      {!loading && !error && mentors && mentors.length > 0 && (
        <>
          <p role="status" className="text-interface text-muted-foreground">
            {mentors.length === 1 ? "1 mentor" : `${mentors.length} mentors`}
          </p>
          <ul className="grid gap-between-groups md:grid-cols-2">
            {mentors.map(({ id, ...mentor }) => (
              <li key={id}>
                <MentorCard {...mentor} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
