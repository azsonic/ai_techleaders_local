import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";

const meta = {
  title: "Primitives/Error state",
  component: ErrorMessage,
  parameters: { layout: "padded" },
  args: {
    title: "Your bookings did not load",
    message:
      "We could not reach the server. Check your connection and try again.",
    action: <Button variant="secondary">Try again</Button>,
  },
  argTypes: {
    title: {
      control: "text",
      description: "What happened. Default: “Something went wrong”.",
    },
    message: {
      control: "text",
      description: "What to do next, in one sentence.",
    },
    action: {
      control: false,
      description: "The next step: usually a retry button.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DefaultTitle: Story = {
  name: "Default title, no message",
  args: { title: undefined, message: undefined, action: undefined },
};

export const NoAccess: Story = {
  name: "Does not exist or no access",
  args: {
    title: "This booking does not exist or you cannot open it",
    message: "Check the link, or go to My bookings to see your sessions.",
    action: <Button variant="secondary">Go to My bookings</Button>,
  },
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    title:
      "The directory could not be loaded because the server did not answer in time",
    message:
      "Your filters are kept. Check your connection and try again, or open a mentor directly by their link.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};

export const RetryByKeyboard: Story = {
  name: "Interaction: announced at once, retry by keyboard",
  args: { action: <Button onClick={fn()}>Try again</Button> },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole("alert")).toHaveTextContent(
      "Your bookings did not load",
    );

    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "Try again" })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(
      (args.action as { props: { onClick: unknown } }).props.onClick,
    ).toHaveBeenCalledTimes(1);
  },
};
