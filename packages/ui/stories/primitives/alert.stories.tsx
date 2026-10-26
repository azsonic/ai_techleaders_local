import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@devmentor/ui/components/ui/alert";
import { TextLink } from "@devmentor/ui/frontend/text-link";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description:
        "default: information, polite. destructive: something failed, announced at once.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Booking opens soon</AlertTitle>
      <AlertDescription>
        Prices and mentors are visible now. Sign-in stays open.
      </AlertDescription>
    </Alert>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-between-groups">
      <Alert>
        <AlertTitle>Booking opens soon</AlertTitle>
        <AlertDescription>
          Prices and mentors are visible now. Sign-in stays open.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>The payment did not go through</AlertTitle>
        <AlertDescription>
          You were not charged and the slot is free again. Try another card or{" "}
          <TextLink href="/mentors">choose another slot</TextLink>.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const RefundOutcome: Story = {
  name: "Cancellation outcome (before payments process)",
  render: () => (
    <Alert>
      <AlertTitle>Full refund due when payments process</AlertTitle>
      <AlertDescription>
        You cancelled more than two hours before the start. The refund is shown
        here once payments are live.
      </AlertDescription>
    </Alert>
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-full max-w-80">
      <Alert variant="destructive">
        <AlertTitle>
          This slot was taken a moment ago and the price on the mentor page has
          changed
        </AlertTitle>
        <AlertDescription>
          Nothing was charged. The list of slots and both prices are refreshed
          below; choose again.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const AnnouncesByVariant: Story = {
  name: "Interaction: roles announce by urgency",
  render: () => (
    <div className="flex flex-col gap-between-groups">
      <Alert>
        <AlertTitle>Booking opens soon</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>The payment did not go through</AlertTitle>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole("status")).toHaveTextContent("Booking opens soon");
    expect(canvas.getByRole("alert")).toHaveTextContent(
      "The payment did not go through",
    );
  },
};
