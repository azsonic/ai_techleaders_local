import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@devmentor/ui/components/ui/popover";

const framed = { docs: { story: { inline: false, height: "260px" } } };

const ZonePopover = ({
  defaultOpen,
  side,
  title = "Which time zone?",
  description = "Times are shown in your time zone. The two-hour cancellation limit counts in Europe/Warsaw.",
}: {
  defaultOpen?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  title?: string;
  description?: string;
}) => (
  <Popover defaultOpen={defaultOpen}>
    <PopoverTrigger render={<Button variant="secondary" size="dense" />}>
      Fri 14:00 (Europe/London)
    </PopoverTrigger>
    <PopoverContent side={side}>
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
        <PopoverDescription>{description}</PopoverDescription>
      </PopoverHeader>
    </PopoverContent>
  </Popover>
);

const meta = {
  title: "Primitives/Popover",
  component: ZonePopover,
  parameters: { layout: "centered" },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Preferred side. It flips when there is no room.",
    },
  },
} satisfies Meta<typeof ZonePopover>;

export const Playground: StoryObj<typeof meta> = {};

export default meta;

type Story = StoryObj<typeof meta>;

export const Open: Story = {
  name: "State: open",
  args: { defaultOpen: true },
  parameters: { layout: "padded", ...framed },
  decorators: [
    (Story) => (
      <div className="pb-section">
        <Story />
      </div>
    ),
  ],
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  args: {
    defaultOpen: true,
    title: "Why this time looks different from the mentor's page",
    description:
      "The mentor publishes hours in Europe/Warsaw. Here they are converted to your time zone, and the two-hour cancellation limit still counts in Europe/Warsaw, so check both before you cancel.",
  },
  parameters: {
    layout: "padded",
    viewport: { defaultViewport: "mobile1" },
    docs: { story: { inline: false, height: "420px" } },
  },
};

export const OpenAndCloseWithKeyboard: Story = {
  name: "Interaction: open with Enter, close with Escape",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: /Fri 14:00/,
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const popover = await within(document.body).findByRole("dialog");
    expect(popover).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).toBeNull(),
    );
    expect(trigger).toHaveFocus();
  },
};
