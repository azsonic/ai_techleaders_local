import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookingClosedNotice } from "@devmentor/ui/components/bookings/booking-closed-notice";

const meta = {
  title: "Product/E02 Find and book/Booking closed notice",
  component: BookingClosedNotice,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookingClosedNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
