import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SlotPreview } from "@devmentor/ui/components/availability/slot-preview";
import { WindowForm } from "@devmentor/ui/components/availability/window-form";
import {
  WindowList,
  type AvailabilityWindow,
} from "@devmentor/ui/components/availability/window-list";

import {
  MANY_SLOTS,
  MANY_WINDOWS,
  NOW,
  SLOTS,
  WINDOWS,
} from "../../../.storybook/docs/e01-data";
import { mockApiCall } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type AvailabilityState =
  "empty" | "windows" | "loading" | "load-error" | "many" | "no-slots";

const add = (values: unknown) =>
  mockApiCall("success", "/api/mentors/availability", values);
const remove = (id: string) =>
  mockApiCall("success", `/api/mentors/availability/${id}`);

const windowsFor = (
  state: AvailabilityState,
): AvailabilityWindow[] | undefined =>
  state === "empty"
    ? []
    : state === "many"
      ? MANY_WINDOWS
      : state === "loading" || state === "load-error"
        ? undefined
        : WINDOWS;

/* Availability page, /mentor/availability (E01-S02). */
const AvailabilityScreen = ({ state }: { state: AvailabilityState }) => (
  <ScreenFrame>
    <h1 className="text-heading-page font-emphasis">Your availability</h1>
    <div className="grid gap-section lg:grid-cols-2">
      <section
        aria-labelledby="add"
        className="flex flex-col gap-between-groups"
      >
        <h2 id="add" className="text-heading-section font-emphasis">
          Add a window
        </h2>
        <WindowForm now={NOW} onSubmit={add} />
      </section>
      <section
        aria-labelledby="upcoming"
        className="flex flex-col gap-between-groups"
      >
        <h2 id="upcoming" className="text-heading-section font-emphasis">
          Upcoming windows
        </h2>
        <WindowList
          windows={windowsFor(state)}
          loading={state === "loading"}
          error={state === "load-error"}
          onRetry={() => undefined}
          onRemove={remove}
        />
      </section>
    </div>
    <section
      aria-labelledby="preview"
      className="flex max-w-prose flex-col gap-between-groups"
    >
      <h2 id="preview" className="text-heading-section font-emphasis">
        What mentees can book
      </h2>
      <SlotPreview
        slots={
          state === "many"
            ? MANY_SLOTS
            : state === "windows"
              ? SLOTS
              : state === "no-slots"
                ? []
                : state === "empty"
                  ? []
                  : undefined
        }
        loading={state === "loading"}
        error={state === "load-error"}
      />
    </section>
  </ScreenFrame>
);

const meta = {
  title: "Product/E01 Mentor supply/Screens/Availability",
  component: AvailabilityScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AvailabilityScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "No windows yet",
  args: { state: "empty" },
};
export const WithWindows: Story = {
  name: "Windows and preview",
  args: { state: "windows" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const ManyWindows: Story = {
  name: "Lots of data (20 windows, 60 slots)",
  args: { state: "many" },
};
export const NoBookableSlots: Story = {
  name: "Windows exist but nothing is bookable",
  args: { state: "no-slots" },
};
