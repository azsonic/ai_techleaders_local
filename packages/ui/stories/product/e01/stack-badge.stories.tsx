import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StackBadge } from "@devmentor/ui/components/mentors/stack-badge";
import { STACKS } from "../../../src/components/mentors/pricing";

const meta = {
  title: "Product/E01 Mentor supply/Stack badge",
  component: StackBadge,
  argTypes: {
    stack: {
      control: "select",
      options: STACKS.map((stack) => stack.value),
      description: "One of the four stacks covered (D07).",
    },
  },
  args: { stack: "typescript" },
} satisfies Meta<typeof StackBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllStacks: Story = {
  name: "Data: all four stacks",
  render: () => (
    <ul aria-label="Stacks" className="flex flex-wrap gap-inline">
      {STACKS.map((stack) => (
        <li key={stack.value}>
          <StackBadge stack={stack.value} />
        </li>
      ))}
    </ul>
  ),
};
