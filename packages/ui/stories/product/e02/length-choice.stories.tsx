import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { LengthChoice } from "@devmentor/ui/components/bookings/length-choice";

import { PRICES } from "../../../.storybook/docs/e02-data";

const Controlled = ({ prices }: { prices: { 25: number; 50: number } }) => {
  const [value, setValue] = useState<"25" | "50" | undefined>();
  return (
    <LengthChoice prices={prices} value={value} onValueChange={setValue} />
  );
};

const meta = {
  title: "Product/E02 Find and book/Length choice",
  component: Controlled,
  parameters: { layout: "padded" },
  args: { prices: PRICES },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Controlled>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const HighestPrices: Story = {
  name: "Data: highest prices (600 and 1200 PLN)",
  args: { prices: { 25: 600, 50: 1200 } },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const ChooseWithKeyboard: Story = {
  name: "Interaction: arrow keys choose a length",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(
      canvas
        .getAllByRole("radio")
        .some((radio) => radio.getAttribute("aria-checked") === "true"),
    ).toBe(true);
  },
};
