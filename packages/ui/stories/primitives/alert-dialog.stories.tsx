import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@devmentor/ui/components/ui/alert-dialog";
import { Button } from "@devmentor/ui/components/ui/button";

const framed = { docs: { story: { inline: false, height: "420px" } } };

const CancelBookingDialog = ({
  defaultOpen,
  title = "Cancel Friday 14:00 with Jan Kowalski?",
  description = "You are cancelling more than two hours before the start: full refund due when payments process.",
  actionLabel = "Cancel session",
  triggerLabel = "Cancel session",
  cancelLabel = "Keep session",
  onConfirm,
}: {
  defaultOpen?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  triggerLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}) => (
  <AlertDialog defaultOpen={defaultOpen}>
    <AlertDialogTrigger render={<Button variant="secondary" size="dense" />}>
      {triggerLabel}
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          {actionLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const meta = {
  title: "Primitives/Confirmation dialog",
  component: CancelBookingDialog,
  parameters: { layout: "centered" },
  argTypes: {
    title: {
      control: "text",
      description: "The question, with the object's name in it.",
    },
    description: {
      control: "text",
      description: "The outcome in one or two sentences.",
    },
    actionLabel: {
      control: "text",
      description: "A verb and object, never “OK”.",
    },
  },
} satisfies Meta<typeof CancelBookingDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = {
  name: "State: open",
  args: { defaultOpen: true },
  parameters: { layout: "fullscreen", ...framed },
};

export const DeleteWindow: Story = {
  name: "Example: delete an availability window",
  parameters: { layout: "fullscreen", ...framed },
  args: {
    defaultOpen: true,
    title: "Delete Tuesday 18:00 to 20:00?",
    description:
      "Mentees can no longer book this window. Sessions already booked in it stay, so cancel them first.",
    actionLabel: "Delete window",
    triggerLabel: "Delete window",
    cancelLabel: "Keep window",
  },
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
    ...framed,
  },
  args: {
    defaultOpen: true,
    title:
      "Cancel Friday 14:00 with Aleksandra Wiśniewska-Kowalczyk, senior platform engineer?",
    description:
      "You are cancelling less than two hours before the start: no refund, and the mentor is paid when payments process.",
  },
};

export const ConfirmAndCancel: Story = {
  name: "Interaction: Cancel has initial focus, outside click keeps it open",
  args: { onConfirm: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Cancel session",
    });

    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("alertdialog");
    const cancel = within(dialog).getByRole("button", { name: "Keep session" });
    await waitFor(() => expect(cancel).toHaveFocus());

    await userEvent.click(document.body);
    expect(within(document.body).getByRole("alertdialog")).toBeVisible();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel session" }),
    );
    expect(args.onConfirm).toHaveBeenCalledTimes(1);

    await userEvent.click(cancel);
    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).toBeNull(),
    );
    expect(trigger).toHaveFocus();
  },
};
