import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { SlotPicker } from "@devmentor/ui/components/bookings/slot-picker";

import { FEW_SLOTS, FOURTEEN_DAYS } from "../../../.storybook/docs/e02-data";

const Controlled = (
  props: Omit<
    React.ComponentProps<typeof SlotPicker>,
    "value" | "onValueChange"
  >,
) => {
  const [value, setValue] = useState<string | undefined>();
  return <SlotPicker {...props} value={value} onValueChange={setValue} />;
};

const meta = {
  title: "Product/E02 Find and book/Slot picker",
  component: Controlled,
  parameters: { layout: "padded" },
  args: { slots: FOURTEEN_DAYS, minutes: 25, zone: "Europe/Warsaw" },
  argTypes: {
    minutes: {
      control: "select",
      options: [25, 50],
      description: "Only slots where this length fits are shown.",
    },
  },
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

export const Fifty: Story = {
  name: "Variant: 50 minutes (fewer slots fit)",
  args: { minutes: 50 },
};

export const Loading: Story = {
  name: "Data: loading",
  args: { slots: undefined, loading: true },
};

export const Empty: Story = {
  name: "Data: empty (nothing in 14 days)",
  args: { slots: [] },
};

export const LoadError: Story = {
  name: "Data: error",
  args: { slots: undefined, error: true },
};

export const Partial: Story = {
  name: "Data: partial (one day)",
  args: { slots: FEW_SLOTS },
};

export const ViewerInLondon: Story = {
  name: "Data: viewer in another zone",
  args: { zone: "Europe/London", slots: FEW_SLOTS },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const ChooseWithKeyboard: Story = {
  name: "Interaction: one tab stop, arrows move and choose",
  args: { slots: FEW_SLOTS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(
      canvas
        .getAllByRole("radio")
        .filter((radio) => radio.getAttribute("aria-checked") === "true"),
    ).toHaveLength(1);
  },
};
