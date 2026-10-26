import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { BookingClosedNotice } from "@devmentor/ui/components/bookings/booking-closed-notice";
import { LengthChoice } from "@devmentor/ui/components/bookings/length-choice";
import { SlotPicker } from "@devmentor/ui/components/bookings/slot-picker";
import { MentorCard } from "@devmentor/ui/components/mentors/mentor-card";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import {
  FEW_SLOTS,
  FOURTEEN_DAYS,
  PRICES,
} from "../../../.storybook/docs/e02-data";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type MentorPageState =
  | "open"
  | "closed"
  | "loading"
  | "not-found"
  | "load-error"
  | "no-slots"
  | "long-text";

const EXPERIENCE =
  "Ten years of TypeScript in fintech. I review architecture, unblock debugging sessions and explain trade-offs in plain words.";

/* Mentor page, /mentors/[slug] (E02-S01, E02-S02): the detail view. Profile on the left, the booking panel beside it. */
const MentorPageScreen = ({ state }: { state: MentorPageState }) => {
  const [length, setLength] = useState<"25" | "50" | undefined>();
  const [slot, setSlot] = useState<string | undefined>();

  if (state === "loading") {
    return (
      <ScreenFrame>
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading the mentor…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-24 w-full max-w-prose" />
            <Skeleton className="h-control w-full max-w-prose" />
          </div>
        </div>
        <h1 className="sr-only">Mentor</h1>
      </ScreenFrame>
    );
  }
  if (state === "not-found") {
    return (
      <ScreenFrame width="prose">
        <h1 className="sr-only">Mentor not found</h1>
        <EmptyState
          title="This mentor does not exist, or you cannot see this page"
          description="The link may be wrong, or the mentor may have stopped sharing it."
          action={
            <a href="/mentors" className={textLinkClassName}>
              Browse mentors
            </a>
          }
        />
      </ScreenFrame>
    );
  }
  if (state === "load-error") {
    return (
      <ScreenFrame width="prose">
        <h1 className="sr-only">Mentor</h1>
        <ErrorMessage
          title="This page did not load"
          message="Nothing was booked. Try again."
          action={
            <Button variant="secondary" size="dense">
              Try again
            </Button>
          }
        />
      </ScreenFrame>
    );
  }

  const name =
    state === "long-text"
      ? "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer"
      : "Anna Kowalska";
  const experience = state === "long-text" ? EXPERIENCE.repeat(8) : EXPERIENCE;
  const slots =
    state === "no-slots"
      ? []
      : state === "long-text"
        ? FEW_SLOTS
        : FOURTEEN_DAYS;

  return (
    <ScreenFrame>
      <div className="grid gap-section lg:grid-cols-[1fr_1.2fr]">
        <section
          aria-label="Mentor"
          className="flex flex-col gap-between-groups"
        >
          <MentorCard
            variant="profile"
            displayName={name}
            stacks={["typescript", "react"]}
            headingLevel={1}
          />
          <p className="text-conversation wrap-anywhere">{experience}</p>
        </section>

        <section
          aria-label="Book a session"
          className="flex flex-col gap-between-groups"
        >
          <LengthChoice
            prices={PRICES}
            value={length}
            onValueChange={(next) => (setLength(next), setSlot(undefined))}
          />
          {state === "closed" ? (
            <BookingClosedNotice />
          ) : length ? (
            <SlotPicker
              slots={slots}
              minutes={Number(length) as 25 | 50}
              value={slot}
              onValueChange={setSlot}
              zone="Europe/Warsaw"
            />
          ) : (
            <p className="text-interface text-muted-foreground">
              Choose a length to see the start times.
            </p>
          )}
          {state !== "closed" && (
            <div className="flex flex-col gap-within-group">
              <Button
                aria-describedby="continue-reason"
                disabled={!slot}
                className="w-full sm:w-fit"
              >
                Continue to booking
              </Button>
              {!slot && (
                <p
                  id="continue-reason"
                  className="text-interface text-muted-foreground"
                >
                  Choose a length and a start time to continue.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E02 Find and book/Screens/Mentor page",
  component: MentorPageScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "open" },
} satisfies Meta<typeof MentorPageScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  name: "Booking open: both prices, choose a length and a slot",
};
export const Closed: Story = {
  name: "Booking closed (public ship)",
  args: { state: "closed" },
};
export const NoSlots: Story = {
  name: "No bookable slots",
  args: { state: "no-slots" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const NotFound: Story = {
  name: "Does not exist or no access",
  args: { state: "not-found" },
};
export const LongText: Story = {
  name: "Long name and text",
  args: { state: "long-text" },
};
