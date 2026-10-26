import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Avatar } from "@devmentor/ui/components/ui/avatar";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  args: { name: "Anna Kowalska" },
  argTypes: {
    name: {
      control: "text",
      description:
        "Full display name. Shown as initials and used as the description.",
    },
    size: {
      control: "select",
      options: ["xs", "default", "lg"],
      description: "24, 32 or 40px.",
    },
    src: {
      control: "text",
      description: "Image address. Initials show while loading or on failure.",
    },
    decorative: {
      control: "boolean",
      description:
        "Hide from screen readers when the name is written next to it.",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-between-groups">
      <Avatar name="Anna Kowalska" size="xs" />
      <Avatar name="Anna Kowalska" />
      <Avatar name="Anna Kowalska" size="lg" />
    </div>
  ),
};

export const WithNameBeside: Story = {
  name: "Next to a name and a time (message attribution)",
  render: () => (
    <div className="flex items-center gap-within-group text-interface">
      <Avatar name="Jan Nowak" decorative />
      <span className="font-emphasis">Jan Nowak</span>
      <span className="text-muted-foreground">14:25</span>
    </div>
  ),
};

export const LongNames: Story = {
  name: "Long and single names, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="flex w-full max-w-80 flex-col gap-within-group">
      {["Aleksandra Wiśniewska-Kowalczyk-Nowak", "Madonna", "Łukasz Żółć"].map(
        (name) => (
          <div
            key={name}
            className="flex items-center gap-within-group text-interface"
          >
            <Avatar name={name} decorative />
            <span className="min-w-0 break-words">{name}</span>
          </div>
        ),
      )}
    </div>
  ),
};

export const InitialsAreTheFallback: Story = {
  name: "Interaction: initials show when the image fails",
  args: { src: "http://localhost:1/missing.png" },
  play: async ({ canvasElement }) => {
    const avatar = within(canvasElement).getByRole("img", {
      name: "Anna Kowalska",
    });

    expect(avatar).toHaveTextContent("AK");
  },
};
