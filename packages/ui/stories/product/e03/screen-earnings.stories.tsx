import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { PayoutRow } from "@devmentor/ui/components/payments/payout-row";
import {
  formatGrosze,
  splitPrice,
} from "../../../src/components/payments/payout";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@devmentor/ui/components/ui/table";

import {
  LONG_MENTEE_NAME,
  MANY_PAYOUTS,
  PAYOUTS,
} from "../../../.storybook/docs/e03-data";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type EarningsState =
  "list" | "empty" | "loading" | "load-error" | "many" | "long-text";

const sum = (rows: typeof PAYOUTS, status: "held" | "paid") =>
  formatGrosze(
    rows
      .filter((row) => row.status === status)
      .reduce((total, row) => total + splitPrice(row.pricePln).payout, 0),
  );

/*
 * Mentor earnings, /mentor/earnings (E03-S03). Proposal: no spec exists for E03. The two totals state the payout rule in
 * numbers: held until the 24-hour report window closes or a dispute is resolved (R16), then paid.
 */
const EarningsScreen = ({ state }: { state: EarningsState }) => {
  const rows =
    state === "many"
      ? MANY_PAYOUTS
      : state === "long-text"
        ? PAYOUTS.map((row, index) =>
            index === 0 ? { ...row, menteeName: LONG_MENTEE_NAME } : row,
          )
        : PAYOUTS;

  return (
    <ScreenFrame>
      <h1 className="text-heading-page font-emphasis">Earnings</h1>
      {state === "loading" && (
        <div className="flex flex-col gap-within-group">
          <LoadingMessage label="Loading your earnings…" />
          <div aria-hidden className="flex flex-col gap-within-group">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}
      {state === "load-error" && (
        <ErrorMessage
          title="Your earnings did not load"
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
          title="No paid sessions yet"
          description="You receive the price minus 20% commission for each completed session. It appears here once a session is booked."
        />
      )}
      {(state === "list" || state === "many" || state === "long-text") && (
        <>
          <dl className="flex flex-wrap gap-x-section gap-y-within-group text-interface">
            <div>
              <dt className="text-muted-foreground">
                Held until the report window closes
              </dt>
              <dd className="text-heading-section font-emphasis tabular-nums">
                {sum(rows, "held")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Paid</dt>
              <dd className="text-heading-section font-emphasis tabular-nums">
                {sum(rows, "paid")}
              </dd>
            </div>
          </dl>
          <Table label="Earnings by session">
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Commission (20%)</TableHead>
                <TableHead className="text-right">You receive</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((payout) => (
                <PayoutRow
                  key={payout.id}
                  payout={payout}
                  zone="Europe/Warsaw"
                />
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E03 Payments/Screens/Mentor earnings",
  component: EarningsScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "list" },
} satisfies Meta<typeof EarningsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  name: "Held, paid, refunded and disputed sessions",
};
export const Empty: Story = {
  name: "No paid sessions yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Many: Story = {
  name: "Lots of data (30 sessions)",
  args: { state: "many" },
};
export const LongText: Story = {
  name: "Long name",
  args: { state: "long-text" },
};
