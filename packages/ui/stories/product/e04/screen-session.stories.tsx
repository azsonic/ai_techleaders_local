import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import type { ApiMode } from "../../../.storybook/docs/mock-api";
import {
  SessionScreen,
  type SessionState,
} from "../../../.storybook/docs/session-screen";

/*
 * Session screen, /sessions/[id] (E04-S01). Proposal: no spec exists for E04. Only the mentee, the mentor and, in a dispute,
 * the operator can open it (D10); everyone else sees the same "does not exist or no access" state (R02).
 */
const meta = {
  title: "Product/E04 Text session/Screens/Session",
  component: SessionScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "live" },
} satisfies Meta<typeof SessionScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

const state = (name: string, value: SessionState): Story => ({
  name,
  args: { state: value },
});

export const NotStarted = state(
  "Not started: the booking question waits",
  "not-started",
);
export const Live = state(
  "In progress: the conversation and the composer",
  "live",
);
export const Sending = state("A message is sending", "sending");
export const NotSent = state("A message was not sent", "not-sent");
export const Ended = state("Ended: composer disabled with the reason", "ended");
export const Loading = state("Loading", "loading");
export const LoadError = state("Error", "load-error");
export const NotFound = state("Does not exist or no access", "not-found");
export const Many = state("Lots of data (60 messages)", "many");
export const LongText = state("Long name and unbroken text", "long-text");

const sends = (mode: ApiMode, name: string, expected: string): Story => ({
  name,
  args: { state: "live", mode },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText("Message"),
      "Thank you, that works.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(canvas.getByRole("log")).toHaveTextContent(expected),
    );
  },
});

export const SendSuccess = sends(
  "success",
  "Send: sent after the server confirmed",
  "Thank you, that works.",
);
export const SendPending = sends(
  "pending",
  "Send: sending (pending)",
  "Sending…",
);
export const SendServerError = sends(
  "server-error",
  "Send: not sent (server error)",
  "Message wasn't sent.",
);
export const SendOffline = sends(
  "offline",
  "Send: not sent (offline)",
  "Message wasn't sent.",
);

export const ComposerStaysVisible: Story = {
  name: "Interaction: the composer is in view with 60 messages",
  args: { state: "many" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText("Message");
    const box = field.getBoundingClientRect();
    expect(box.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(box.top).toBeGreaterThanOrEqual(0);
  },
};
