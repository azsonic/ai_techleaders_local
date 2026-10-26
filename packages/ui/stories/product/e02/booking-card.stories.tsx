import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { BookingCard } from "@devmentor/ui/components/bookings/booking-card";

import { BOOKINGS, LONG_QUESTION } from "../../../.storybook/docs/e02-data";

const meta = {
  title: "Product/E02 Find and book/Booking card",
  component: BookingCard,
  parameters: { layout: "padded" },
  args: {
    booking: BOOKINGS[0],
    viewer: "mentee",
    zone: "Europe/Warsaw",
    href: "/bookings/b1",
    onCancel: fn(),
  },
  argTypes: {
    viewer: {
      control: "select",
      options: ["mentee", "mentor"],
      description: "Who is looking: changes labels and the person named.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const JustBooked: Story = {
  name: "State: booked a moment ago (free cancellation)",
  args: { justBooked: true },
};

export const EveryStatus: Story = {
  name: "Data: every status",
  render: (args) => (
    <div className="flex flex-col">
      {BOOKINGS.map((booking) => (
        <BookingCard key={booking.id} {...args} booking={booking} />
      ))}
    </div>
  ),
};

export const MentorView: Story = {
  name: "Variant: as the mentor",
  args: { viewer: "mentor", href: "/mentor/bookings/b1" },
};

export const LongTextNarrow: Story = {
  name: "Data: long question and name, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    booking: {
      ...BOOKINGS[0],
      question: LONG_QUESTION,
      counterpartName:
        "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer",
    },
  },
};

export const CancelReportsBooking: Story = {
  name: "Interaction: cancel reports the booking",
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", {
        name: "Cancel session with Anna Kowalska",
      }),
    );
    expect(args.onCancel).toHaveBeenCalledWith("b1");
  },
};
