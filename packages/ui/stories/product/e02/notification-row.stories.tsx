import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NotificationRow } from "@devmentor/ui/components/bookings/notification-row";

const meta = {
  title: "Product/E02 Find and book/Notification row",
  component: NotificationRow,
  parameters: { layout: "padded" },
  args: {
    kind: "booking.confirmed",
    counterpartName: "Anna Kowalska",
    startsAt: "2026-11-13T09:00:00Z",
    href: "/bookings/b1",
    zone: "Europe/Warsaw",
  },
  argTypes: {
    kind: {
      control: "select",
      options: ["booking.confirmed", "booking.cancelled"],
      description: "Only these two events exist (R10, D21).",
    },
  },
  render: (args) => (
    <ul className="w-full max-w-prose">
      <NotificationRow {...args} />
    </ul>
  ),
} satisfies Meta<typeof NotificationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Unread: Story = { name: "State: unread", args: { unread: true } };

export const CancelledWithReason: Story = {
  name: "Data: cancelled by the mentor, with the reason",
  args: {
    kind: "booking.cancelled",
    unread: true,
    reason: "I am unavailable. Note: family emergency.",
  },
};

export const LongTextNarrow: Story = {
  name: "Data: long name and reason, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    kind: "booking.cancelled",
    counterpartName:
      "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer",
    reason: "The question is out of scope. Note: ".concat(
      "a long explanation ".repeat(8),
    ),
  },
};
