import { useState } from "react";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import {
  BookingCard,
  type BookingView,
} from "@devmentor/ui/components/bookings/booking-card";
import {
  bookingStatusLabel,
  type BookingStatusValue,
  type BookingViewer,
} from "@devmentor/ui/components/bookings/booking-status";
import { FilteredList } from "@devmentor/ui/components/lists/filtered-list";
import { CancelDialog } from "@devmentor/ui/components/bookings/cancel-dialog";
import type { RefundOutcome } from "../../src/components/bookings/refund-outcome";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@devmentor/ui/components/ui/tabs";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { BOOKINGS, MANY_BOOKINGS } from "./e02-data";
import { mockApiCall, type ApiMode } from "./mock-api";
import { ScreenFrame } from "./screen";

export type BookingsState =
  | "list"
  | "empty"
  | "loading"
  | "load-error"
  | "many"
  | "past"
  | "past-no-results"
  | "just-booked"
  | "cancel-open";

const PAST_STATUSES: BookingStatusValue[] = [
  "completed",
  "no_show_mentee",
  "no_show_mentor",
];

const TABS = [
  { value: "upcoming", label: "Upcoming", statuses: ["pending", "confirmed"] },
  {
    value: "past",
    label: "Past",
    statuses: ["completed", "no_show_mentee", "no_show_mentor"],
  },
  {
    value: "cancelled",
    label: "Cancelled",
    statuses: ["cancelled_by_mentee", "cancelled_by_mentor"],
  },
] as const;

/**
 * Documentation helper: the page composition shared by "My bookings" (mentee) and "Mentor bookings" (mentor).
 * The application page will own the same composition; the data states and the dialog are the real components.
 */
export function BookingsScreen({
  viewer,
  state,
  outcome = "full",
  cancelMode = "success",
}: {
  viewer: BookingViewer;
  state: BookingsState;
  outcome?: RefundOutcome;
  cancelMode?: ApiMode;
}) {
  const [cancelling, setCancelling] = useState<BookingView | null>(
    state === "cancel-open" ? BOOKINGS[0] : null,
  );
  const [outcomes, setOutcomes] = useState<BookingStatusValue[]>(
    state === "past-no-results" ? ["no_show_mentor"] : [],
  );
  const title = viewer === "mentee" ? "My bookings" : "Mentor bookings";
  const source =
    state === "many" ? MANY_BOOKINGS : state === "empty" ? [] : BOOKINGS;

  const card = (booking: BookingView) => (
    <BookingCard
      key={booking.id}
      booking={booking}
      viewer={viewer}
      zone="Europe/Warsaw"
      href={`${viewer === "mentee" ? "/bookings" : "/mentor/bookings"}/${booking.id}`}
      justBooked={state === "just-booked" && booking.id === "b1"}
      onCancel={() => setCancelling(booking)}
    />
  );

  /* Past: the outcome filter on the shared filtered list. Loading and error stay with the tab (they are the page's). */
  const past = () => {
    const rows = source
      .filter((booking) => PAST_STATUSES.includes(booking.status))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    const shown = outcomes.length
      ? rows.filter((booking) => outcomes.includes(booking.status))
      : rows;
    return (
      <FilteredList
        items={shown}
        renderItem={card}
        filter={{
          legend: "Outcome",
          options: PAST_STATUSES.map((value) => ({
            value,
            label: bookingStatusLabel(value, viewer),
          })),
        }}
        selected={outcomes}
        onSelectedChange={setOutcomes}
        noun={{ singular: "booking", plural: "bookings" }}
        description="Most recent first"
        noResults={{
          title: "No past bookings for this outcome",
          description: "Remove a filter to see more past bookings.",
        }}
        nothingYet={{
          title: "No past bookings",
          description: "They appear here once there is something to show.",
        }}
        listClassName="flex flex-col"
      />
    );
  };

  const panel = (statuses: readonly string[], tab: string) => {
    if (tab === "past") return past();
    const rows = source.filter((booking) => statuses.includes(booking.status));
    if (rows.length === 0) {
      return (
        <EmptyState
          title={`No ${tab} bookings`}
          description={
            tab === "upcoming" && viewer === "mentee"
              ? "Find a mentor and book a text session."
              : tab === "upcoming"
                ? "Sessions booked in your published windows appear here."
                : "They appear here once there is something to show."
          }
          action={
            tab === "upcoming" && viewer === "mentee" ? (
              <a href="/mentors" className={textLinkClassName}>
                Find a mentor
              </a>
            ) : undefined
          }
        />
      );
    }
    return <div className="flex flex-col">{rows.map(card)}</div>;
  };

  return (
    <ScreenFrame width="prose">
      <h1 className="text-heading-page font-emphasis">{title}</h1>
      {state === "loading" && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading your bookings…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      )}
      {state === "load-error" && (
        <ErrorMessage
          title="Your bookings did not load"
          message="Nothing was changed. Try again."
          action={
            <Button variant="secondary" size="dense">
              Try again
            </Button>
          }
        />
      )}
      {state !== "loading" && state !== "load-error" && (
        <Tabs defaultValue={state.startsWith("past") ? "past" : "upcoming"}>
          <TabsList aria-label={title}>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {panel(tab.statuses, tab.value)}
            </TabsContent>
          ))}
        </Tabs>
      )}
      {cancelling &&
        (viewer === "mentee" ? (
          <CancelDialog
            viewer="mentee"
            outcome={outcome}
            open
            onOpenChange={(open) => !open && setCancelling(null)}
            counterpartName={cancelling.counterpartName}
            startsAt={cancelling.startsAt}
            zone="Europe/Warsaw"
            onConfirm={(input) =>
              mockApiCall(
                cancelMode,
                `/api/bookings/${cancelling.id}/cancel`,
                input,
              )
            }
          />
        ) : (
          <CancelDialog
            viewer="mentor"
            open
            onOpenChange={(open) => !open && setCancelling(null)}
            counterpartName={cancelling.counterpartName}
            startsAt={cancelling.startsAt}
            zone="Europe/Warsaw"
            onConfirm={(input) =>
              mockApiCall(
                cancelMode,
                `/api/bookings/${cancelling.id}/cancel`,
                input,
              )
            }
          />
        ))}
    </ScreenFrame>
  );
}
