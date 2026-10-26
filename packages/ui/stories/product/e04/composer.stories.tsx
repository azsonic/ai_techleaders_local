import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Composer } from "@devmentor/ui/components/messages/composer";

const meta = {
  title: "Product/E04 Text session/Composer",
  component: Composer,
  parameters: { layout: "padded" },
  args: { onSend: fn() },
  argTypes: {
    disabledReason: {
      control: "text",
      description:
        "Set when nobody can write now. The reason is written beside the field and read with it.",
    },
  },
  render: (args) => (
    <div className="w-full max-w-prose">
      <Composer {...args} />
    </div>
  ),
} satisfies Meta<typeof Composer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SessionEnded: Story = {
  name: "State: disabled, with the reason",
  args: { disabledReason: "This session has ended." },
};

export const Narrow: Story = {
  name: "Narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const SendsAndClears: Story = {
  name: "Interaction: sends the text and clears the field",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText("Message");
    await userEvent.type(field, "Try the key prop.");
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    expect(args.onSend).toHaveBeenCalledWith("Try the key prop.");
    expect(field).toHaveValue("");
  },
};

export const EnterAddsALine: Story = {
  name: "Interaction: Enter adds a line, it does not send",
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByLabelText("Message");
    await userEvent.type(field, "One{Enter}Two");
    expect(field).toHaveValue("One\nTwo");
    expect(args.onSend).not.toHaveBeenCalled();
  },
};

export const EmptyIsRefused: Story = {
  name: "Interaction: an empty message is refused and the field is focused",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    expect(canvas.getByRole("alert")).toHaveTextContent(
      "Write a message to send.",
    );
    expect(canvas.getByLabelText("Message")).toHaveFocus();
    expect(args.onSend).not.toHaveBeenCalled();
  },
};
