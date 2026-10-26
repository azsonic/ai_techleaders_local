import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Separator } from "@devmentor/ui/components/ui/separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Direction of the line.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BetweenRows: Story = {
  name: "Between booking rows",
  render: () => (
    <ul className="text-interface">
      {[
        ["Tue 14:00, 25 minutes", "Anna Kowalska"],
        ["Wed 11:15, 50 minutes", "Jan Nowak"],
        ["Fri 18:00, 25 minutes", "Maria Zielińska"],
      ].map(([when, who], index) => (
        <li key={when}>
          {index > 0 && <Separator />}
          <div className="flex justify-between py-within-group">
            <span className="font-emphasis">{when}</span>
            <span className="text-muted-foreground">{who}</span>
          </div>
        </li>
      ))}
    </ul>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-between-groups text-interface">
      <span>Profile</span>
      <Separator orientation="vertical" />
      <span>Availability</span>
      <Separator orientation="vertical" />
      <span>Bookings</span>
    </div>
  ),
};

export const LongContentNarrow: Story = {
  name: "Narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-full max-w-80">
      <p className="text-interface">Mentors in the directory</p>
      <Separator />
      <p className="text-interface">Mentors reachable by link only</p>
    </div>
  ),
};

export const ExposesItsOrientation: Story = {
  name: "Interaction: exposes its orientation to assistive technology",
  render: () => (
    <div>
      <Separator orientation="vertical" className="h-6" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const line = within(canvasElement).getByRole("separator");

    expect(line).toHaveAttribute("aria-orientation", "vertical");
  },
};
