import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { UsefulnessCheck } from "@devmentor/ui/components/sessions/usefulness-check";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { LONG_AUTHOR } from "../../../.storybook/docs/e04-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type CheckState = "ready" | "answered" | "long-text";

/*
 * Usefulness check, /sessions/[id]/feedback (E04-S02). Proposal: no spec exists for E04; the question comes from the brief's
 * "user outcome check" (D11). It is the mentee's, once, after the session ends.
 */
const UsefulnessScreen = ({
  state,
  mode = "success",
}: {
  state: CheckState;
  mode?: ApiMode;
}) => (
  <ScreenFrame width="prose">
    <h1 className="text-heading-page font-emphasis">How did it go?</h1>
    <UsefulnessCheck
      mentorName={state === "long-text" ? LONG_AUTHOR : "Anna Kowalska"}
      answered={state === "answered" ? "yes" : undefined}
      onSubmit={(answer) =>
        mockApiCall(mode, "/api/sessions/s1/usefulness", { answer })
      }
    />
    <p className="text-interface">
      <a href="/bookings" className={textLinkClassName}>
        Back to My bookings
      </a>
    </p>
  </ScreenFrame>
);

const meta = {
  title: "Product/E04 Text session/Screens/Usefulness check",
  component: UsefulnessScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "ready" },
} satisfies Meta<typeof UsefulnessScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = { name: "Ready: one question, three answers" };
export const Answered: Story = {
  name: "Already answered",
  args: { state: "answered" },
};
export const LongText: Story = {
  name: "Long name",
  args: { state: "long-text" },
};

const submits = (mode: ApiMode, name: string, expected: string): Story => ({
  name,
  args: { mode },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("radio", { name: "No, it arrived too late" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send answer" }));
    await waitFor(() => expect(canvasElement).toHaveTextContent(expected));
  },
});

export const Pending = submits("pending", "Sending (pending)", "Sending…");
export const ServerError = submits(
  "server-error",
  "Server error",
  "Your answer was not saved",
);
export const Offline = submits(
  "offline",
  "Offline",
  "The server did not answer",
);
export const Saved = submits(
  "success",
  "Saved, after the server confirmed",
  "Thank you. Your answer is saved.",
);
