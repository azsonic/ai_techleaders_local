import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import { ContrastTable } from "../../.storybook/docs/helpers";

const meta = {
  title: "Foundations/Contrast check",
  component: ContrastTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ContrastTable>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Fails when any supported text, boundary or focus pair drops below its threshold in the active theme. */
export const AllPairsPass: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByTestId("contrast-table");
    await waitFor(() =>
      expect(table.querySelectorAll("tbody tr").length).toBeGreaterThan(0),
    );
    expect(table).not.toHaveTextContent("fail");
  },
};
