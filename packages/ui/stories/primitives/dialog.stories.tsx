import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@devmentor/ui/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@devmentor/ui/components/ui/field";
import { Textarea } from "@devmentor/ui/components/ui/textarea";

/* Open dialogs cover the whole page, so in the docs they render in their own frame. */
const framed = { docs: { story: { inline: false, height: "460px" } } };

const AvailabilityDialog = ({
  defaultOpen,
  showCloseButton,
  title = "Add availability window",
  description = "Times are shown in Europe/Warsaw. Sessions are 25 or 50 minutes.",
}: {
  defaultOpen?: boolean;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
}) => (
  <Dialog defaultOpen={defaultOpen}>
    <DialogTrigger render={<Button variant="secondary" />}>
      Add window
    </DialogTrigger>
    <DialogContent showCloseButton={showCloseButton}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field>
          <FieldLabel>Note for mentees (optional)</FieldLabel>
          <FieldDescription>
            Shown next to this window on your profile.
          </FieldDescription>
          <Textarea rows={3} />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="secondary" />}>
          Cancel
        </DialogClose>
        <Button>Save window</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const meta = {
  title: "Primitives/Dialog",
  component: AvailabilityDialog,
  parameters: { layout: "centered" },
  argTypes: {
    showCloseButton: {
      control: "boolean",
      description:
        "Close button in the corner. On by default; hide it only when a footer action always closes the dialog.",
    },
  },
} satisfies Meta<typeof AvailabilityDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { showCloseButton: true },
};

export const Open: Story = {
  name: "State: open",
  args: { defaultOpen: true },
  parameters: { layout: "fullscreen", ...framed },
};

export const WithoutCloseButton: Story = {
  name: "Variant: without the corner close button",
  args: { defaultOpen: true, showCloseButton: false },
  parameters: { layout: "fullscreen", ...framed },
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  args: {
    defaultOpen: true,
    title: "Add an availability window for the Tuesday evening block",
    description:
      "Times are shown in Europe/Warsaw, where the two-hour cancellation limit is stated. Mentees in other time zones see their own local time as well.",
  },
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
    ...framed,
  },
};

export const TaskDialog: Story = {
  name: "Example: mentor cancels a booked session",
  parameters: { layout: "centered" },
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" size="dense" />}>
        Cancel session
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Friday 14:00 with Marta Zielińska?</DialogTitle>
          <DialogDescription>
            She gets a full refund outcome and sees your reason.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Reason</FieldLabel>
            <FieldDescription>Required. Marta sees this.</FieldDescription>
            <Textarea rows={3} />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Keep session
          </DialogClose>
          <Button variant="destructive">Cancel session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const OpenAndCloseWithKeyboard: Story = {
  name: "Interaction: open, trap focus, close with Escape",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Add window",
    });

    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog", {
      name: "Add availability window",
    });
    expect(dialog).toBeVisible();
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );
    // The page behind is hidden from assistive technology while the dialog is open.
    expect(
      within(document.body).queryByRole("button", { name: "Add window" }),
    ).toBeNull();

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).toBeNull(),
    );
    expect(trigger).toHaveFocus();
  },
};
