import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const VARIANTS = [
  "default",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Book 25 minutes", onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
      description: "Visual priority. One default button per view.",
    },
    size: {
      control: "select",
      options: ["default", "dense", "xs", "icon", "icon-dense", "icon-xs"],
      description:
        "default 40px for forms and booking, dense 32px for browsing rows, xs 24px minimum target.",
    },
    loading: {
      control: "boolean",
      description:
        "Blocks repeat activation and announces busy. Stays focusable.",
    },
    loadingLabel: {
      control: "text",
      description: "Replaces the label while loading, for example “Saving…”.",
    },
    disabled: {
      control: "boolean",
      description:
        "Unavailable. Always give the reason as text next to the button.",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-between-groups">
      <Button>Book 25 minutes</Button>
      <Button variant="secondary">Message mentor</Button>
      <Button variant="ghost">Show details</Button>
      <Button variant="destructive">Cancel booking</Button>
      <Button variant="link">Read the cancellation rule</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-between-groups">
      <Button>Default 40px</Button>
      <Button size="dense">Dense 32px</Button>
      <Button size="xs">Extra small 24px</Button>
      <Button size="icon" aria-label="Close">
        ×
      </Button>
      <Button size="icon-dense" aria-label="Close">
        ×
      </Button>
      <Button size="icon-xs" aria-label="Close">
        ×
      </Button>
    </div>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  render: () => (
    <StateMatrix
      rows={[...VARIANTS]}
      states={["default", "hover", "focus", "pressed", "disabled", "loading"]}
      render={(row, state) => (
        <Button
          variant={row as (typeof VARIANTS)[number]}
          disabled={state === "disabled"}
          loading={state === "loading"}
          loadingLabel={state === "loading" ? "Saving…" : undefined}
          {...frozen(state)}
        >
          {state === "disabled" ? "Unavailable" : "Save"}
        </Button>
      )}
    />
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="flex w-full max-w-80 flex-col gap-within-group">
      <Button className="h-auto min-h-control whitespace-normal py-within-group">
        Cancel booking with Aleksandra Wiśniewska-Kowalczyk-Nowak
      </Button>
      <Button
        variant="secondary"
        className="h-auto min-h-control whitespace-normal py-within-group"
      >
        Message the mentor about the failing database migration in production
      </Button>
    </div>
  ),
};

export const ClickAndKeyboard: Story = {
  name: "Interaction: click and keyboard",
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Book 25 minutes",
    });

    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    await userEvent.tab({ shift: true });
    expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const LoadingBlocksRepeat: Story = {
  name: "Interaction: loading blocks a second activation",
  args: { loading: true, loadingLabel: "Booking…" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Booking…",
    });

    // Pointer events are off while busy; the keyboard still reaches the button and must be blocked too.
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(args.onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-busy", "true");
  },
};
