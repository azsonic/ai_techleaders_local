import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { MentorDirectory } from "@devmentor/ui/components/mentors/mentor-directory";
import type { Stack } from "../../../src/components/mentors/pricing";

import { MANY_MENTORS, MENTORS } from "../../../.storybook/docs/e02-data";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type DirectoryState =
  | "list"
  | "loading"
  | "nothing-yet"
  | "no-results"
  | "load-error"
  | "many"
  | "booking-closed";

/* Directory page, /mentors (E02-S01). Public, no sign-in. */
const DirectoryScreen = ({ state }: { state: DirectoryState }) => {
  const [selected, setSelected] = useState<Stack[]>(
    state === "no-results" ? ["ai-agents"] : [],
  );
  const all =
    state === "many"
      ? MANY_MENTORS
      : state === "nothing-yet" || state === "no-results"
        ? []
        : MENTORS;
  const mentors =
    state === "loading" || state === "load-error"
      ? undefined
      : selected.length && state !== "no-results"
        ? all.filter((m) => m.stacks.some((s) => selected.includes(s)))
        : all;

  return (
    <ScreenFrame>
      <h1 className="text-heading-page font-emphasis">Mentors</h1>
      <MentorDirectory
        mentors={mentors}
        selected={selected}
        onSelectedChange={setSelected}
        loading={state === "loading"}
        error={state === "load-error"}
        onRetry={() => undefined}
        bookingClosed={state === "booking-closed"}
      />
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E02 Find and book/Screens/Directory",
  component: DirectoryScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "list" },
} satisfies Meta<typeof DirectoryScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Mentors with a stack filter" };
export const Loading: Story = { args: { state: "loading" } };
export const NothingYet: Story = {
  name: "No mentor listed yet",
  args: { state: "nothing-yet" },
};
export const NoResults: Story = {
  name: "No results for the filters",
  args: { state: "no-results" },
};
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const Many: Story = {
  name: "Lots of data (30 mentors)",
  args: { state: "many" },
};
export const BookingClosed: Story = {
  name: "Booking closed (public ship)",
  args: { state: "booking-closed" },
};
