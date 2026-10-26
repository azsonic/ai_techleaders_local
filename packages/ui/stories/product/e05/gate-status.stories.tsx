import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GateStatus } from "@devmentor/ui/components/operator/gate-status";

const meta = {
  title: "Product/E05 Supply gate and pilot/Gate status",
  component: GateStatus,
  parameters: { layout: "padded" },
  args: { state: "closed", invited: 20, accepted: 7, published: 2 },
  argTypes: {
    state: {
      control: "select",
      options: ["closed", "open", "stopped"],
      description:
        "Decided by the launch gate on the server (D16), shown in words.",
    },
    required: {
      control: "number",
      description: "Mentors that must publish for the gate to pass. Default 5.",
    },
  },
  render: (args) => (
    <div className="max-w-prose">
      <GateStatus {...args} />
    </div>
  ),
} satisfies Meta<typeof GateStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Collecting: Story = { name: "State: closed, collecting" };
export const AlmostThere: Story = {
  name: "Data: one mentor short",
  args: { accepted: 9, published: 4 },
};
export const Open: Story = {
  name: "State: open",
  args: { state: "open", accepted: 9, published: 5 },
};
export const Stopped: Story = {
  name: "State: stopped",
  args: { state: "stopped", accepted: 6, published: 3 },
};
export const NothingYet: Story = {
  name: "Data: no invitations yet",
  args: { invited: 0, accepted: 0, published: 0 },
};
export const Narrow: Story = {
  name: "Narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
