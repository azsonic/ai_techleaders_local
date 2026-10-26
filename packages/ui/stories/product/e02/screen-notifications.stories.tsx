import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { NotificationRow } from "@devmentor/ui/components/bookings/notification-row";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";

import { ScreenFrame } from "../../../.storybook/docs/screen";

type NotificationsState = "list" | "empty" | "loading" | "load-error" | "many";

const base = { zone: "Europe/Warsaw", href: "/bookings/b1" } as const;

const ROWS = [
  {
    kind: "booking.cancelled",
    counterpartName: "Anna Kowalska",
    startsAt: "2026-11-13T09:00:00Z",
    unread: true,
    reason: "I am unavailable.",
    ...base,
  },
  {
    kind: "booking.confirmed",
    counterpartName: "Piotr Nowak",
    startsAt: "2026-11-16T17:00:00Z",
    unread: true,
    ...base,
  },
  {
    kind: "booking.confirmed",
    counterpartName: "Marta Zielińska",
    startsAt: "2026-11-09T09:00:00Z",
    ...base,
  },
] as const;

const MANY = Array.from({ length: 30 }, (_, index) => ({
  ...ROWS[index % ROWS.length],
  unread: index < 3,
}));

/* Notifications page, /notifications (E02-S03, R10): booking confirmed and booking cancelled only. */
const NotificationsScreen = ({ state }: { state: NotificationsState }) => (
  <ScreenFrame width="prose">
    <h1 className="text-heading-page font-emphasis">Notifications</h1>
    {state === "loading" && (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Loading notifications…" />
        <div aria-hidden className="flex flex-col gap-within-group">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )}
    {state === "load-error" && (
      <ErrorMessage
        title="Notifications did not load"
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
        title="No notifications yet"
        description="You will see a notice here when a booking is confirmed or cancelled."
      />
    )}
    {(state === "list" || state === "many") && (
      <ul
        aria-label="Notifications"
        className="flex flex-col border-t border-border"
      >
        {(state === "many" ? MANY : ROWS).map((row, index) => (
          <NotificationRow key={index} {...row} />
        ))}
      </ul>
    )}
  </ScreenFrame>
);

const meta = {
  title: "Product/E02 Find and book/Screens/Notifications",
  component: NotificationsScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "list" },
} satisfies Meta<typeof NotificationsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Unread and read notices" };
export const Empty: Story = {
  name: "No notifications yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Many: Story = {
  name: "Lots of data (30 notices)",
  args: { state: "many" },
};
