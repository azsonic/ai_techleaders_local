import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookingSummary } from "@devmentor/ui/components/bookings/booking-summary";

const meta = {
  title: "Product/E02 Find and book/Booking summary",
  component: BookingSummary,
  parameters: { layout: "padded" },
  args: {
    mentorName: "Anna Kowalska",
    minutes: 25,
    startsAt: "2026-11-13T09:00:00Z",
    pricePln: 120,
    zone: "Europe/London",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookingSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Fifty: Story = {
  name: "Data: 50 minutes at a high price",
  args: { minutes: 50, pricePln: 1200 },
};

export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    mentorName:
      "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer",
  },
};
