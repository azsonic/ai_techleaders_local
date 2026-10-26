import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";

const meta = {
  title: "Primitives/Empty state",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    title: "No bookings yet",
    description: "When you book a session it appears here with its status.",
    action: <Button variant="secondary">Find a mentor</Button>,
  },
  argTypes: {
    title: { control: "text", description: "What is empty." },
    description: {
      control: "text",
      description: "Why it is empty, in one sentence.",
    },
    action: {
      control: false,
      description: "The next step: one button or link.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NothingHereYet: Story = {
  name: "Nothing here yet",
  args: {
    title: "No invitations yet",
    description: "Create the first invitation to bring a mentor in.",
    action: <Button>Create invitation</Button>,
  },
};

export const NoResultsForFilters: Story = {
  name: "No results for these filters",
  args: {
    title: "No mentors match TypeScript and Python",
    description: "Remove a filter to see more mentors with a free slot.",
    action: <Button variant="secondary">Clear filters</Button>,
  },
};

export const NobodyBookable: Story = {
  name: "Nobody bookable (directory)",
  args: {
    title: "No mentor has a free slot right now",
    description:
      "Mentors appear here as soon as they publish a slot. Check back later or open a mentor by link.",
    action: undefined,
  },
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    title: "No mentors match TypeScript, React, Python and AI agents together",
    description:
      "Remove one of the filters to see mentors who cover fewer of these stacks and still have a slot in the next fourteen days.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};

export const ClearFilters: Story = {
  name: "Interaction: the action leads out of the empty state",
  args: { action: <Button onClick={fn()}>Clear filters</Button> },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "Clear filters" })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(
      (args.action as { props: { onClick: unknown } }).props.onClick,
    ).toHaveBeenCalledTimes(1);
  },
};
