import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CopyIcon } from "lucide-react";

import { Button } from "@devmentor/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@devmentor/ui/components/ui/tooltip";

const framed = { docs: { story: { inline: false, height: "160px" } } };

const CopyLinkTooltip = ({
  defaultOpen,
  side,
  label = "Copy booking link",
}: {
  defaultOpen?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  label?: string;
}) => (
  <TooltipProvider>
    <Tooltip defaultOpen={defaultOpen}>
      <TooltipTrigger
        render={
          <Button variant="secondary" size="icon-dense" aria-label={label} />
        }
      >
        <CopyIcon aria-hidden />
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const meta = {
  title: "Primitives/Tooltip",
  component: CopyLinkTooltip,
  parameters: { layout: "centered" },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Preferred side. It flips when there is no room.",
    },
    label: {
      control: "text",
      description: "A short name of the control, not instructions.",
    },
  },
} satisfies Meta<typeof CopyLinkTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = {
  name: "State: open",
  args: { defaultOpen: true },
  parameters: { layout: "padded", ...framed },
  decorators: [
    (Story) => (
      <div className="pt-section">
        <Story />
      </div>
    ),
  ],
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  args: {
    defaultOpen: true,
    side: "bottom",
    label:
      "Copy the booking link for Aleksandra Wiśniewska-Kowalczyk's 50 minute session",
  },
  parameters: {
    layout: "padded",
    viewport: { defaultViewport: "mobile1" },
    docs: { story: { inline: false, height: "200px" } },
  },
};

export const ShowsOnFocusAndHidesOnEscape: Story = {
  name: "Interaction: shows on keyboard focus, hides on Escape",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Copy booking link",
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    const tip = await within(document.body).findByText("Copy booking link", {
      selector: "[data-slot=tooltip-content]",
    });
    expect(tip).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        document.body.querySelector("[data-slot=tooltip-content]"),
      ).toBeNull(),
    );
  },
};
