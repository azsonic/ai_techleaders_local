import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookingsScreen } from "../../../.storybook/docs/bookings-screen";

const framed = {
  layout: "fullscreen",
  docs: { story: { inline: false, height: "640px" } },
};

const meta = {
  title: "Product/E02 Find and book/Screens/My bookings",
  component: BookingsScreen,
  parameters: { layout: "fullscreen" },
  args: { viewer: "mentee", state: "list" },
} satisfies Meta<typeof BookingsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Upcoming, past and cancelled" };
export const JustBooked: Story = {
  name: "Booked a moment ago (free cancellation)",
  args: { state: "just-booked" },
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
export const Many: Story = {
  name: "Lots of data (25 bookings)",
  args: { state: "many" },
};
export const CancelFullRefund: Story = {
  name: "Cancel dialog: full refund",
  args: { state: "cancel-open", outcome: "full" },
  parameters: framed,
};
export const CancelGrace: Story = {
  name: "Cancel dialog: within the grace",
  args: { state: "cancel-open", outcome: "full-grace" },
  parameters: framed,
};
export const CancelNoRefund: Story = {
  name: "Cancel dialog: no refund",
  args: { state: "cancel-open", outcome: "none" },
  parameters: framed,
};
export const CancelServerError: Story = {
  name: "Cancel dialog: server error after confirm",
  args: { state: "cancel-open", cancelMode: "server-error" },
  parameters: framed,
};
