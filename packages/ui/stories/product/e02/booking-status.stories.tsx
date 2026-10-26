import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  BookingStatus,
  type BookingStatusValue,
} from "@devmentor/ui/components/bookings/booking-status";

const STATUSES: BookingStatusValue[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled_by_mentee",
  "cancelled_by_mentor",
  "no_show_mentee",
  "no_show_mentor",
];

const meta = {
  title: "Product/E02 Find and book/Booking status",
  component: BookingStatus,
  args: { status: "confirmed", viewer: "mentee" },
  argTypes: {
    status: {
      control: "select",
      options: STATUSES,
      description: "From the booking state machine.",
    },
    viewer: {
      control: "select",
      options: ["mentee", "mentor"],
      description:
        "Cancellation labels name who cancelled, from the viewer's side.",
    },
  },
} satisfies Meta<typeof BookingStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const EveryStatus: Story = {
  name: "Data: every status, both viewers",
  render: () => (
    <div className="flex flex-col gap-between-groups">
      {(["mentee", "mentor"] as const).map((viewer) => (
        <ul
          key={viewer}
          aria-label={`As ${viewer}`}
          className="flex flex-wrap gap-within-group"
        >
          {STATUSES.map((status) => (
            <li key={status}>
              <BookingStatus status={status} viewer={viewer} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  ),
};
