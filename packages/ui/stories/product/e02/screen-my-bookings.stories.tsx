import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

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
export const PastFilter: Story = {
  name: "Past: filter by outcome",
  args: { state: "past" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("2 bookings");
    expect(canvas.getByText("Most recent first")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("checkbox", { name: "You did not attend" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("1 booking"),
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear filters" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("2 bookings"),
    );
  },
};
export const PastNoResults: Story = {
  name: "Past: no results for the outcome",
  args: { state: "past-no-results" },
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
