import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { OperatorActionDialog } from "@devmentor/ui/components/operator/operator-action-dialog";
import { Button } from "@devmentor/ui/components/ui/button";

import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";

const framed = {
  layout: "fullscreen",
  docs: { story: { inline: false, height: "560px" } },
};

const ACTIONS = {
  suspend: {
    title: "Suspend Anna Kowalska?",
    consequence:
      "Her profile is hidden and her 2 future bookings are cancelled with full refunds.",
    confirmLabel: "Suspend mentor",
    loadingLabel: "Suspending…",
  },
  revoke: {
    title: "Revoke the invitation for ewa.mazur@example.com?",
    consequence:
      "The link stops working. The invitation stays in the list and is still counted by the gate.",
    confirmLabel: "Revoke invitation",
    loadingLabel: "Revoking…",
  },
} as const;

const Demo = ({
  action = "suspend",
  mode = "success",
  defaultOpen = false,
  title,
}: {
  action?: keyof typeof ACTIONS;
  mode?: ApiMode;
  defaultOpen?: boolean;
  title?: string;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button variant="secondary" size="dense" onClick={() => setOpen(true)}>
        {ACTIONS[action].confirmLabel}…
      </Button>
      <OperatorActionDialog
        {...ACTIONS[action]}
        title={title ?? ACTIONS[action].title}
        open={open}
        onOpenChange={setOpen}
        onConfirm={(input) => mockApiCall(mode, "/api/operator/actions", input)}
      />
    </>
  );
};

const meta = {
  title: "Product/E05 Supply gate and pilot/Operator action dialog",
  component: Demo,
  parameters: { layout: "centered" },
  argTypes: {
    action: {
      control: "select",
      options: ["suspend", "revoke"],
      description:
        "The two operator actions that change someone else's data (D29).",
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Suspend: Story = {
  name: "Suspend a mentor",
  args: { defaultOpen: true },
  parameters: framed,
};
export const RevokeInvitation: Story = {
  name: "Revoke an invitation",
  args: { action: "revoke", defaultOpen: true },
  parameters: framed,
};
export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  args: {
    defaultOpen: true,
    title:
      "Suspend Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer?",
  },
  parameters: { ...framed, viewport: { defaultViewport: "mobile1" } },
};

const confirmWith = (mode: ApiMode, name: string, expected: string): Story => ({
  name,
  args: { mode, defaultOpen: true },
  parameters: framed,
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Reason"),
      "Two no-shows.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^Suspend/ }),
    );
    if (expected === "busy")
      await waitFor(() =>
        expect(
          within(dialog).getByRole("button", { name: "Suspending…" }),
        ).toHaveAttribute("aria-busy", "true"),
      );
    else await waitFor(() => expect(dialog).toHaveTextContent(expected));
  },
});

export const Pending = confirmWith("pending", "Suspending (pending)", "busy");
export const ServerError = confirmWith(
  "server-error",
  "Server error: the dialog stays open",
  "Something broke on our side",
);
export const Offline = confirmWith(
  "offline",
  "Offline: the dialog stays open",
  "The server did not answer",
);

export const ReasonRequired: Story = {
  name: "Interaction: no reason, no action, and the field is focused",
  args: { defaultOpen: true },
  parameters: framed,
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Suspend mentor" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Write a reason. It is logged with the action.",
    );
    await waitFor(() =>
      expect(within(dialog).getByLabelText("Reason")).toHaveFocus(),
    );
  },
};

export const ConfirmCloses: Story = {
  name: "Interaction: the dialog closes after the server answered",
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Suspend mentor…" }),
    );
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText("Reason"),
      "Two no-shows.",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Suspend mentor" }),
    );
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).toBeNull(),
    );
  },
};
