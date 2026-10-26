import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CancelDialog } from "@devmentor/ui/components/bookings/cancel-dialog";
import type { RefundOutcome } from "../../../src/components/bookings/refund-outcome";
import { Button } from "@devmentor/ui/components/ui/button";

import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";

const framed = {
  layout: "fullscreen",
  docs: { story: { inline: false, height: "520px" } },
};

const Demo = ({
  viewer,
  outcome = "full",
  mode = "success",
  counterpartName = "Jan Kowalski",
  defaultOpen = false,
}: {
  viewer: "mentee" | "mentor";
  outcome?: RefundOutcome;
  mode?: ApiMode;
  counterpartName?: string;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const common = {
    open,
    onOpenChange: setOpen,
    counterpartName,
    startsAt: "2026-11-13T09:00:00Z",
    zone: "Europe/Warsaw",
    onConfirm: (input: unknown) =>
      mockApiCall(mode, "/api/bookings/b1/cancel", input),
  };
  return (
    <>
      <Button variant="secondary" size="dense" onClick={() => setOpen(true)}>
        Cancel session…
      </Button>
      {viewer === "mentee" ? (
        <CancelDialog {...common} viewer="mentee" outcome={outcome} />
      ) : (
        <CancelDialog {...common} viewer="mentor" />
      )}
    </>
  );
};

const meta = {
  title: "Product/E02 Find and book/Cancel dialog",
  component: Demo,
  parameters: { layout: "centered" },
  args: { viewer: "mentee" },
  argTypes: {
    viewer: {
      control: "select",
      options: ["mentee", "mentor"],
      description:
        "mentee: a question with the refund outcome. mentor: a required reason.",
    },
    outcome: {
      control: "select",
      options: ["full-grace", "full", "none"],
      description:
        "Mentee only: computed by the booking policy, shown in words.",
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const MenteeFullRefund: Story = {
  name: "Mentee: at least two hours before",
  args: { defaultOpen: true, outcome: "full" },
  parameters: framed,
};
export const MenteeGrace: Story = {
  name: "Mentee: within the 15-minute grace",
  args: { defaultOpen: true, outcome: "full-grace" },
  parameters: framed,
};
export const MenteeNoRefund: Story = {
  name: "Mentee: less than two hours before (no refund)",
  args: { defaultOpen: true, outcome: "none" },
  parameters: framed,
};
export const MentorReason: Story = {
  name: "Mentor: reason required",
  args: { viewer: "mentor", defaultOpen: true },
  parameters: framed,
};

export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  args: {
    viewer: "mentor",
    defaultOpen: true,
    counterpartName:
      "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer",
  },
  parameters: { ...framed, viewport: { defaultViewport: "mobile1" } },
};

const confirmWith = (
  mode: ApiMode,
  viewer: "mentee" | "mentor",
  name: string,
  expected?: string,
): Story => ({
  name,
  args: { viewer, mode, defaultOpen: true },
  parameters: framed,
  play: async () => {
    const dialog = await within(document.body).findByRole(
      viewer === "mentee" ? "alertdialog" : "dialog",
    );
    if (viewer === "mentor")
      await userEvent.click(
        within(dialog).getByRole("radio", { name: "I am unavailable" }),
      );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel session" }),
    );
    if (expected)
      await waitFor(() => expect(dialog).toHaveTextContent(expected));
    else
      await waitFor(() =>
        expect(
          within(dialog).getByRole("button", { name: "Cancelling…" }),
        ).toBeVisible(),
      );
  },
});

export const MenteePending = confirmWith(
  "pending",
  "mentee",
  "Mentee: cancelling (pending)",
);
export const MenteeServerError = confirmWith(
  "server-error",
  "mentee",
  "Mentee: server error",
  "Something broke on our side",
);
export const MenteeOffline = confirmWith(
  "offline",
  "mentee",
  "Mentee: offline",
  "The server did not answer",
);
export const MentorServerError = confirmWith(
  "server-error",
  "mentor",
  "Mentor: server error",
  "Something broke on our side",
);

export const MentorMustChooseReason: Story = {
  name: "Interaction: a mentor cannot cancel without a reason",
  args: { viewer: "mentor", defaultOpen: true },
  parameters: framed,
  play: async () => {
    const dialog = await within(document.body).findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel session" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Choose a reason.",
    );
    await waitFor(() =>
      expect(within(dialog).getAllByRole("radio")[0]).toHaveFocus(),
    );
  },
};

export const MenteeConfirms: Story = {
  name: "Interaction: Cancel has initial focus, the dialog closes after the server answered",
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Cancel session…" }),
    );
    const dialog = await within(document.body).findByRole("alertdialog");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Keep session" }),
      ).toHaveFocus(),
    );

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel session" }),
    );

    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).toBeNull(),
    );
  },
};
