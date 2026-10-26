import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@devmentor/ui/components/ui/tabs";

import { frozen, type PreviewState } from "../../.storybook/docs/states";

const MyBookings = ({
  defaultValue = "upcoming",
  orientation,
}: {
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
}) => (
  <Tabs
    defaultValue={defaultValue}
    orientation={orientation}
    className="w-96 max-w-full"
  >
    <TabsList aria-label="My bookings">
      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
      <TabsTrigger value="past">Past</TabsTrigger>
      <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
    </TabsList>
    <TabsContent value="upcoming">
      Friday 14:00, 25 minutes, with Jan Kowalski.
    </TabsContent>
    <TabsContent value="past">
      Monday 10:00, 50 minutes, with Marta Zielińska.
    </TabsContent>
    <TabsContent value="cancelled">No cancelled bookings.</TabsContent>
  </Tabs>
);

const meta = {
  title: "Primitives/Tabs",
  component: MyBookings,
  parameters: { layout: "padded" },
  argTypes: {
    defaultValue: {
      control: "select",
      options: ["upcoming", "past", "cancelled"],
      description: "The tab selected first.",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description:
        "Horizontal is the only orientation used in the product so far.",
    },
  },
} satisfies Meta<typeof MyBookings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const TAB_STATES: { state: PreviewState | "selected"; label: string }[] = [
  { state: "default", label: "Default" },
  { state: "hover", label: "Hover" },
  { state: "focus", label: "Focus" },
  { state: "selected", label: "Selected" },
  { state: "disabled", label: "Disabled" },
];

export const StateMatrixStory: Story = {
  name: "State matrix",
  render: () => (
    <Tabs defaultValue="selected" className="max-w-full">
      <TabsList aria-label="Tab states">
        {TAB_STATES.map(({ state, label }) => (
          <TabsTrigger
            key={state}
            value={state}
            disabled={state === "disabled"}
            {...(frozen(state as PreviewState) as Record<string, string>)}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  ),
};

export const ManyTabsNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <Tabs defaultValue="a" className="w-72 max-w-full">
      <TabsList aria-label="Mentor profile sections">
        <TabsTrigger value="a">Profile and availability</TabsTrigger>
        <TabsTrigger value="b">Booked sessions this month</TabsTrigger>
        <TabsTrigger value="c">Cancellations</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Prices, stack and weekly windows.</TabsContent>
    </Tabs>
  ),
};

export const ArrowKeysSelect: Story = {
  name: "Interaction: arrow keys move and select",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const upcoming = canvas.getByRole("tab", { name: "Upcoming" });

    await userEvent.tab();
    expect(upcoming).toHaveFocus();
    expect(upcoming).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}");
    const past = canvas.getByRole("tab", { name: "Past" });
    expect(past).toHaveFocus();
    expect(past).toHaveAttribute("aria-selected", "true");
    await waitFor(() =>
      expect(canvas.getByRole("tabpanel")).toHaveTextContent("Marta Zielińska"),
    );

    await userEvent.click(canvas.getByRole("tab", { name: "Cancelled" }));
    await waitFor(() =>
      expect(canvas.getByRole("tabpanel")).toHaveTextContent(
        "No cancelled bookings.",
      ),
    );
  },
};
