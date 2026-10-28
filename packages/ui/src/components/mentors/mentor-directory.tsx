"use client";

import { BookingClosedNotice } from "../bookings/booking-closed-notice";
import { FilteredList } from "../lists/filtered-list";
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
 * The directory (E02-S01), built on the filtered list pattern: the visible stack filter, the announced count and the
 * two empty states live in `FilteredList`. This component adds the mentor cards and the booking-closed notice.
 * No ratings (N02).
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
  return (
    <FilteredList
      items={mentors}
      renderItem={(mentor) => (
        <MentorCard
          displayName={mentor.displayName}
          stacks={mentor.stacks}
          priceFrom={mentor.priceFrom}
          nearestSlot={mentor.nearestSlot}
          href={mentor.href}
        />
      )}
      filter={{ legend: "Stack", options: STACKS }}
      selected={selected}
      onSelectedChange={onSelectedChange}
      noun={{ singular: "mentor", plural: "mentors" }}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeleton={
        <>
          <MentorCardSkeleton />
          <MentorCardSkeleton />
        </>
      }
      loadingLabel="Loading mentors…"
      errorTitle="Mentors did not load"
      noResults={{
        title: "No mentors for these filters",
        description: "Remove a filter to see more mentors.",
      }}
      nothingYet={{
        title: "No mentors are listed yet",
        description:
          "Mentors appear here once they publish prices and availability. Check back soon.",
      }}
      notice={bookingClosed && <BookingClosedNotice />}
    />
  );
}
