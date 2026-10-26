import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { BanIcon, CheckIcon, ClockIcon } from "lucide-react";

import { Badge } from "@devmentor/ui/components/ui/badge";

const meta = {
  title: "Primitives/Status badge",
  component: Badge,
  args: { children: "Confirmed" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive"],
      description:
        "default: the current or active status. secondary: waiting or past. destructive: cancelled or failed.",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BookingStatuses: Story = {
  name: "Booking statuses",
  render: () => (
    <div className="flex flex-wrap items-center gap-within-group">
      <Badge>
        <CheckIcon aria-hidden />
        Confirmed
      </Badge>
      <Badge variant="secondary">
        <ClockIcon aria-hidden />
        Completed
      </Badge>
      <Badge variant="destructive">
        <BanIcon aria-hidden />
        Cancelled
      </Badge>
    </div>
  ),
};

export const InvitationStatuses: Story = {
  name: "Invitation statuses (operator list)",
  render: () => (
    <div className="flex flex-wrap items-center gap-within-group">
      <Badge variant="secondary">Pending</Badge>
      <Badge>Accepted</Badge>
      <Badge variant="secondary">Expired</Badge>
      <Badge variant="destructive">Revoked</Badge>
    </div>
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="flex w-full max-w-80 flex-wrap gap-within-group">
      <Badge variant="destructive">
        Cancelled by mentor, full refund due when payments process
      </Badge>
    </div>
  ),
};

export const StatusIsText: Story = {
  name: "Interaction: the status is readable text, the icon is hidden",
  render: () => (
    <Badge variant="destructive">
      <BanIcon aria-hidden data-testid="icon" />
      Cancelled
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Cancelled")).toBeVisible();
    expect(canvas.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  },
};
