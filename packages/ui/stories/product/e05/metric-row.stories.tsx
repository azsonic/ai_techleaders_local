import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricRow } from "@devmentor/ui/components/operator/metric-row";

const meta = {
  title: "Product/E05 Supply gate and pilot/Metric row",
  component: MetricRow,
  parameters: { layout: "padded" },
  args: {
    label: "Time from booking to start",
    value: "3 h 10 min",
    detail:
      "Median of confirmed bookings. DevMentor records it and promises no start time (D20).",
  },
  render: (args) => (
    <dl className="max-w-content border-t border-border">
      <MetricRow {...args} />
    </dl>
  ),
} satisfies Meta<typeof MetricRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const NoData: Story = {
  name: "Data: no data yet",
  args: { value: undefined },
};
export const Several: Story = {
  name: "Several measures together",
  render: () => (
    <dl className="max-w-content border-t border-border">
      <MetricRow
        label="Completed paid sessions this week"
        value="6 of 10"
        detail="The pilot target is 10 in each of two consecutive weeks (D11)."
      />
      <MetricRow
        label="Booked through a mentor's link"
        value="5 of 8"
        detail="Source of every booking is tracked (D19)."
      />
      <MetricRow label="Refunds" />
    </dl>
  ),
};
export const LongNarrow: Story = {
  name: "Data: long label and detail, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    label:
      "Bookings cancelled by the mentor with the reason “the question is out of scope”",
    detail:
      "Counted from the cancellation records, per mentor, since the pilot started. ".repeat(
        3,
      ),
    value: "12 of 40",
  },
};
