import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import {
  MentorCard,
  MentorCardSkeleton,
} from "@devmentor/ui/components/mentors/mentor-card";

const meta = {
  title: "Product/E01 Mentor supply/Mentor card",
  component: MentorCard,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "select",
      options: ["listing", "profile"],
      description:
        "listing: directory row. profile: the read-only public card.",
    },
    priceFrom: {
      control: "number",
      description:
        "Lowest of the two prices, whole zloty. Null until prices are saved.",
    },
    nearestSlot: {
      control: "text",
      description: "Nearest bookable slot, formatted. Null when there is none.",
    },
    headingLevel: {
      control: "select",
      options: [1, 2, 3],
      description: "Heading level of the name, to fit the page outline.",
    },
  },
  args: {
    displayName: "Anna Kowalska",
    stacks: ["typescript", "react"],
    priceFrom: 90,
    nearestSlot: "Fri 13 Nov, 10:00",
    href: "/mentors/anna-kowalska",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MentorCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  name: "Data: loading",
  render: () => (
    <div className="flex flex-col gap-within-group">
      <LoadingMessage label="Loading mentors…" />
      <MentorCardSkeleton />
    </div>
  ),
};

export const PartialData: Story = {
  name: "Data: partial (no prices, no slot)",
  args: { priceFrom: null, nearestSlot: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Prices not set yet")).toBeVisible();
    expect(canvas.getByText("No bookable slot yet")).toBeVisible();
  },
};

export const AllStacks: Story = {
  name: "Data: all four stacks",
  args: { stacks: ["typescript", "react", "python", "ai-agents"] },
};

export const LongTextNarrow: Story = {
  name: "Data: long text, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    displayName:
      "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer",
    stacks: ["typescript", "react", "python", "ai-agents"],
    nearestSlot: "Wednesday 25 November, 18:00 (Europe/Warsaw)",
  },
};

export const PublicProfile: Story = {
  name: "Variant: public profile",
  args: { variant: "profile", headingLevel: 1, href: undefined },
};
