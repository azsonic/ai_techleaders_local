import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SlotPreview } from "@devmentor/ui/components/availability/slot-preview";

import { MANY_SLOTS, SLOTS } from "../../../.storybook/docs/e01-data";

const meta = {
  title: "Product/E01 Mentor supply/Slot preview",
  component: SlotPreview,
  parameters: { layout: "padded" },
  args: { slots: SLOTS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SlotPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  name: "Data: loading",
  args: { slots: undefined, loading: true },
};

export const Empty: Story = {
  name: "Data: empty (nothing bookable yet)",
  args: { slots: [] },
};

export const LoadError: Story = {
  name: "Data: error",
  args: { slots: undefined, error: true },
};

export const PartialDay: Story = {
  name: "Data: partial (one short day)",
  args: { slots: SLOTS.slice(0, 2) },
};

export const ManySlots: Story = {
  name: "Data: lots (five days, 60 slots)",
  args: { slots: MANY_SLOTS },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
