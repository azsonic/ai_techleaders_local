import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { MetricRow } from "@devmentor/ui/components/operator/metric-row";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";

import { ScreenFrame } from "../../../.storybook/docs/screen";

type MetricsState = "list" | "partial" | "empty" | "loading" | "load-error";

/*
 * Pilot measures, /admin/metrics (E05-S02, D11, D19, D20). Proposal: no E05 specification exists. Timing, payments, refunds and
 * booking source, each with how it is counted. A measure without data says so; it never shows 0.
 */
const MetricsScreen = ({ state }: { state: MetricsState }) => {
  const partial = state === "partial";
  return (
    <ScreenFrame width="prose">
      <h1 className="text-heading-page font-emphasis">Pilot measures</h1>
      {state === "loading" && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading the measures…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      )}
      {state === "load-error" && (
        <ErrorMessage
          title="The measures did not load"
          message="Nothing was changed. Try again."
          action={
            <Button variant="secondary" size="dense">
              Try again
            </Button>
          }
        />
      )}
      {state === "empty" && (
        <EmptyState
          title="No bookings yet"
          description="The measures appear after the first booking."
        />
      )}
      {(state === "list" || partial) && (
        <>
          <section className="flex flex-col gap-within-group">
            <h2 className="text-heading-section font-emphasis">Timing</h2>
            <dl className="border-t border-border">
              <MetricRow
                label="Time from booking to start"
                value="3 h 10 min"
                detail="Median of confirmed bookings. DevMentor records it and promises no start time (D20)."
              />
              <MetricRow
                label="Completed paid sessions this week"
                value="6 of 10"
                detail="The pilot target is 10 in each of two consecutive weeks (D11)."
              />
            </dl>
          </section>
          <section className="flex flex-col gap-within-group">
            <h2 className="text-heading-section font-emphasis">
              Payments and refunds
            </h2>
            <dl className="border-t border-border">
              <MetricRow
                label="Paid bookings this week"
                value="8"
                detail="Confirmed bookings with a charge in test mode (D18)."
              />
              <MetricRow
                label="Refunded bookings"
                value={partial ? undefined : "2 of 8"}
                detail="Full refunds under R04, R09 and R15."
              />
            </dl>
          </section>
          <section className="flex flex-col gap-within-group">
            <h2 className="text-heading-section font-emphasis">
              Booking source
            </h2>
            <dl className="border-t border-border">
              <MetricRow
                label="Through a mentor's link"
                value="5 of 8"
                detail="The source of every booking is tracked (D19)."
              />
              <MetricRow
                label="Through the directory"
                value={partial ? undefined : "3 of 8"}
              />
            </dl>
          </section>
          <section className="flex flex-col gap-within-group">
            <h2 className="text-heading-section font-emphasis">Outcome</h2>
            <dl className="border-t border-border">
              <MetricRow
                label="Help arrived before the deadline"
                value="5 of 6"
                detail="From the usefulness check; mentees with no deadline are left out (D11)."
              />
            </dl>
          </section>
        </>
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E05 Supply gate and pilot/Screens/Metrics",
  component: MetricsScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "list" },
} satisfies Meta<typeof MetricsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Timing, payments, source and outcome" };
export const Partial: Story = {
  name: "Partial data: some measures have no data yet",
  args: { state: "partial" },
};
export const Empty: Story = {
  name: "No bookings yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
