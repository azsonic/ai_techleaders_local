import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookingsScreen } from "../../../.storybook/docs/bookings-screen";

const framed = {
  layout: "fullscreen",
  docs: { story: { inline: false, height: "640px" } },
};

const meta = {
  title: "Product/E02 Find and book/Screens/Mentor bookings",
  component: BookingsScreen,
  parameters: { layout: "fullscreen" },
  args: { viewer: "mentor", state: "list" },
} satisfies Meta<typeof BookingsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Upcoming, past and cancelled" };
export const Empty: Story = {
  name: "No booked sessions yet",
  args: { state: "empty" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Many: Story = {
  name: "Lots of data (25 bookings)",
  args: { state: "many" },
};
export const CancelReason: Story = {
  name: "Cancel dialog: reason required",
  args: { state: "cancel-open" },
  parameters: framed,
};
export const CancelServerError: Story = {
  name: "Cancel dialog: server error after confirm",
  args: { state: "cancel-open", cancelMode: "server-error" },
  parameters: framed,
};
