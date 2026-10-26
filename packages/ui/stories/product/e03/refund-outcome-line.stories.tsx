import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  RefundOutcomeLine,
  type MoneyOutcome,
} from "@devmentor/ui/components/payments/refund-outcome-line";

const OUTCOMES: MoneyOutcome[] = [
  "grace",
  "full",
  "late",
  "mentor-cancelled",
  "mentor-absent",
  "nobody-present",
  "mentee-absent",
];

const meta = {
  title: "Product/E03 Payments/Refund outcome line",
  component: RefundOutcomeLine,
  parameters: { layout: "padded" },
  args: { outcome: "full", pricePln: 120 },
  argTypes: {
    outcome: {
      control: "select",
      options: OUTCOMES,
      description:
        "Chosen by the booking policy in core (R04, R09, R15, R16); this component only words it.",
    },
    pricePln: {
      control: { type: "number", min: 90, max: 1200 },
      description: "The price the mentee paid, whole zloty.",
    },
    settled: {
      control: "boolean",
      description: 'The refund has been made. Before that it says "due".',
    },
  },
  render: (args) => (
    <div className="max-w-prose">
      <RefundOutcomeLine {...args} />
    </div>
  ),
} satisfies Meta<typeof RefundOutcomeLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const EveryOutcome: Story = {
  name: "Every outcome",
  render: (args) => (
    <ul className="flex max-w-prose flex-col gap-between-groups">
      {OUTCOMES.map((outcome) => (
        <li key={outcome}>
          <RefundOutcomeLine {...args} outcome={outcome} />
        </li>
      ))}
    </ul>
  ),
};

export const Settled: Story = {
  name: "State: refund made",
  args: { outcome: "mentor-cancelled", settled: true },
};

export const HighestPriceNarrow: Story = {
  name: "Data: highest price, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { outcome: "nobody-present", pricePln: 1200 },
};
