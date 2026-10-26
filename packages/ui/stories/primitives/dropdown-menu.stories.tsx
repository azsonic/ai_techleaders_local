import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EllipsisIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@devmentor/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@devmentor/ui/components/ui/dropdown-menu";

const framed = { docs: { story: { inline: false, height: "300px" } } };

const BookingActions = ({
  defaultOpen,
  label = "Actions for Friday 14:00",
}: {
  defaultOpen?: boolean;
  label?: string;
}) => {
  const [last, setLast] = useState("none");
  return (
    <div className="flex flex-col items-start gap-within-group">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger
          render={
            <Button variant="secondary" size="icon-dense" aria-label={label} />
          }
        >
          <EllipsisIcon aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Friday 14:00, Jan Kowalski</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setLast("open")}>
              Open booking
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLast("copy")}>
              Copy session link
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Reschedule</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setLast("cancel")}
          >
            Cancel session…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-interface text-muted-foreground" aria-live="polite">
        Last chosen: {last}
      </p>
    </div>
  );
};

const meta = {
  title: "Primitives/Menu",
  component: BookingActions,
  parameters: { layout: "centered" },
  argTypes: {
    label: {
      control: "text",
      description:
        "Accessible name of the button that opens the menu. Name the object.",
    },
  },
} satisfies Meta<typeof BookingActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/* Highlighted, disabled and destructive items are shown as the real component renders them. */
export const Open: Story = {
  name: "State matrix: items in an open menu",
  args: { defaultOpen: true },
  parameters: { layout: "padded", ...framed },
};

export const ChoiceItems: Story = {
  name: "Variants: checkbox and radio items",
  parameters: { layout: "padded", ...framed },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="secondary" size="dense" />}>
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup defaultValue="soonest">
          <DropdownMenuLabel>Order by</DropdownMenuLabel>
          <DropdownMenuRadioItem value="soonest">
            Soonest slot
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price">
            Lowest price
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem defaultChecked>
          Show past sessions
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: {
    layout: "padded",
    viewport: { defaultViewport: "mobile1" },
    docs: { story: { inline: false, height: "320px" } },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="secondary" size="dense" />}>
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Copy the session link for Aleksandra Wiśniewska-Kowalczyk
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          Cancel session…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ChooseWithKeyboard: Story = {
  name: "Interaction: open, move, choose and return focus",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Actions for Friday 14:00",
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const menu = await within(document.body).findByRole("menu");
    expect(menu).toBeVisible();

    await waitFor(() =>
      expect(document.activeElement).toHaveTextContent("Open booking"),
    );

    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() =>
      expect(canvas.getByText("Last chosen: copy")).toBeVisible(),
    );
    await waitFor(() =>
      expect(within(document.body).queryByRole("menu")).toBeNull(),
    );
    expect(trigger).toHaveFocus();
  },
};
