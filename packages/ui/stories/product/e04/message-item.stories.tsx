import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  MessageItem,
  type MessageView,
} from "@devmentor/ui/components/messages/message-item";

import { LONG_AUTHOR, LONG_MESSAGE } from "../../../.storybook/docs/e04-data";

const base: MessageView = {
  id: "m1",
  authorName: "Anna Kowalska",
  sentAt: "2026-11-13T09:04:00Z",
  body: "Make the effect safe to run twice: return a cleanup that aborts the request.",
};

const meta = {
  title: "Product/E04 Text session/Message item",
  component: MessageItem,
  parameters: { layout: "padded" },
  args: { message: base, zone: "Europe/Warsaw", onRetry: fn() },
  argTypes: {
    message: {
      description:
        "Author, time, text and, for your own messages, a delivery state (P12).",
    },
  },
  render: (args) => (
    <ul className="w-full max-w-prose">
      <MessageItem {...args} />
    </ul>
  ),
} satisfies Meta<typeof MessageItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Own: Story = {
  name: "Your own message",
  args: { message: { ...base, own: true } },
};

export const Sending: Story = {
  name: "State: sending",
  args: { message: { ...base, own: true, delivery: "sending" } },
};
export const Sent: Story = {
  name: "State: sent",
  args: { message: { ...base, own: true, delivery: "sent" } },
};
export const NotSent: Story = {
  name: "State: not sent, with retry",
  args: { message: { ...base, own: true, delivery: "failed" } },
};

export const BookingQuestion: Story = {
  name: "Data: the booking question as the first message",
  args: {
    message: {
      ...base,
      authorName: "Jan Kowalski",
      caption: "Booking question",
    },
  },
};

export const DeletedUser: Story = {
  name: "Data: an anonymised account (D30)",
  args: { message: { ...base, authorName: "Deleted user" } },
};

export const MultiLine: Story = {
  name: "Data: line breaks are kept",
  args: {
    message: {
      ...base,
      body: "First line.\n\nSecond paragraph after a blank line.\n  An indented line.",
    },
  },
};

export const LongTextNarrow: Story = {
  name: "Data: long name and unbroken text, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    message: { ...base, authorName: LONG_AUTHOR, body: LONG_MESSAGE },
  },
};

export const RetryTheFailedMessage: Story = {
  name: "Interaction: Try again retries that message",
  args: { message: { ...base, own: true, delivery: "failed" } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("alert")).toHaveTextContent("Message wasn't sent.");
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    expect(args.onRetry).toHaveBeenCalledWith("m1");
  },
};
