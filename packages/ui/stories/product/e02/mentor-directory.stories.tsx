import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { MentorDirectory } from "@devmentor/ui/components/mentors/mentor-directory";
import type { Stack } from "../../../src/components/mentors/pricing";

import { MANY_MENTORS, MENTORS } from "../../../.storybook/docs/e02-data";

/** Filters on the client for the story; in the application the server filters and the page passes the result. */
const Filtered = ({
  all,
  initial = [],
  ...rest
}: Omit<
  React.ComponentProps<typeof MentorDirectory>,
  "mentors" | "selected" | "onSelectedChange"
> & {
  all: React.ComponentProps<typeof MentorDirectory>["mentors"];
  initial?: Stack[];
}) => {
  const [selected, setSelected] = useState<Stack[]>(initial);
  const mentors =
    all &&
    (selected.length
      ? all.filter((m) => m.stacks.some((s) => selected.includes(s)))
      : all);
  return (
    <MentorDirectory
      {...rest}
      mentors={mentors}
      selected={selected}
      onSelectedChange={setSelected}
    />
  );
};

const meta = {
  title: "Product/E02 Find and book/Mentor directory",
  component: Filtered,
  parameters: { layout: "padded" },
  args: { all: MENTORS },
} satisfies Meta<typeof Filtered>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  name: "Data: loading",
  args: { all: undefined, loading: true },
};

export const NothingHereYet: Story = {
  name: "Data: nothing here yet (no mentor listed)",
  args: { all: [] },
};

export const NoResultsForFilters: Story = {
  name: "Data: no results for these filters",
  args: { all: [], initial: ["ai-agents"] as Stack[] },
};

export const LoadError: Story = {
  name: "Data: error",
  args: { all: undefined, error: true, onRetry: () => undefined },
};

export const PartialData: Story = {
  name: "Data: partial (a mentor without prices or slot)",
  args: {
    all: [
      ...MENTORS.slice(0, 2),
      { ...MENTORS[2], priceFrom: null, nearestSlot: null },
    ],
  },
};

export const ManyMentors: Story = {
  name: "Data: lots (30 mentors)",
  args: { all: MANY_MENTORS },
};

export const BookingClosed: Story = {
  name: "State: booking closed",
  args: { bookingClosed: true },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const FilterAndClear: Story = {
  name: "Interaction: filter narrows the list and the count, Clear filters restores it",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("status")).toHaveTextContent("4 mentors");

    await userEvent.click(canvas.getByRole("checkbox", { name: "Python" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("1 mentor"),
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear filters" }),
    );
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("4 mentors"),
    );
  },
};
