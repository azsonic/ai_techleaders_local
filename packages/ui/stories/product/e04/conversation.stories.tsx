import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Conversation } from "@devmentor/ui/components/messages/conversation";
import type { MessageView } from "@devmentor/ui/components/messages/message-item";

import { CONVERSATION, MANY_MESSAGES } from "../../../.storybook/docs/e04-data";
import type { ApiMode } from "../../../.storybook/docs/mock-api";
import { useMockMessages } from "../../../.storybook/docs/session-screen";

const Demo = ({
  initial,
  mode = "success",
  disabledReason,
}: {
  initial: MessageView[];
  mode?: ApiMode;
  disabledReason?: string;
}) => {
  const { messages, send, retry } = useMockMessages(initial, mode);
  return (
    <div className="flex h-96 w-full max-w-prose flex-col border border-border">
      <Conversation
        messages={messages}
        zone="Europe/Warsaw"
        onSend={send}
        onRetry={retry}
        disabledReason={disabledReason}
      />
    </div>
  );
};

const meta = {
  title: "Product/E04 Text session/Conversation",
  component: Demo,
  parameters: { layout: "padded" },
  args: { initial: CONVERSATION },
  argTypes: {
    mode: {
      control: "select",
      options: ["success", "pending", "server-error", "offline"],
      description: "What the mocked server answers to the next message.",
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  name: "Data: no messages yet",
  args: { initial: [] },
};
export const Many: Story = {
  name: "Data: lots of messages (60)",
  args: { initial: MANY_MESSAGES },
};
export const Ended: Story = {
  name: "State: composer disabled, with the reason",
  args: { disabledReason: "This session has ended." },
};
export const Narrow: Story = {
  name: "Narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

const writes = (mode: ApiMode, name: string, expected: string): Story => ({
  name,
  args: { mode },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText("Message"),
      "Thanks, that helps.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(canvas.getByRole("log")).toHaveTextContent(expected),
    );
    expect(canvas.getByLabelText("Message")).toHaveValue("");
  },
});

export const SendingMessage = writes(
  "pending",
  "Interaction: Sending, and the field is free again",
  "Sending…",
);
export const SentMessage = writes(
  "success",
  "Interaction: Sent, after the server confirmed",
  "Sent",
);
export const NotSentServer = writes(
  "server-error",
  "Interaction: Not sent (server error), with retry",
  "Message wasn't sent.",
);
export const NotSentOffline = writes(
  "offline",
  "Interaction: Not sent (offline), with retry",
  "Message wasn't sent.",
);

export const SecondMessageWhileSending: Story = {
  name: "Interaction: a second message can be written while the first is sending",
  args: { mode: "pending" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText("Message");
    await userEvent.type(field, "First.");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await userEvent.type(field, "Second.");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await waitFor(() =>
      expect(canvas.getAllByText("Sending…")).toHaveLength(2),
    );
  },
};

export const RetryAfterFailure: Story = {
  name: "Interaction: Try again sends the same text again",
  args: {
    initial: CONVERSATION.map((message) =>
      message.id === "m4" ? { ...message, delivery: "failed" } : message,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(canvas.queryByText("Message wasn't sent.")).toBeNull(),
    );
    expect(canvas.getByRole("log")).toHaveTextContent("Does the same apply");
  },
};

export const LogIsKeyboardScrollable: Story = {
  name: "Interaction: the message log takes focus for scrolling",
  args: { initial: MANY_MESSAGES },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    expect(canvas.getByRole("log", { name: "Messages" })).toHaveFocus();
  },
};
