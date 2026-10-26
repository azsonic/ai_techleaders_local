import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Textarea } from "@devmentor/ui/components/ui/textarea";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  args: {
    "aria-label": "Your question",
    placeholder:
      "For example: my migration fails with a foreign key error on staging.",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Unavailable. Say why in the hint.",
    },
    maxLength: {
      control: "number",
      description:
        "Hard limit. The booking question is at most 2,000 characters.",
    },
    rows: {
      control: "number",
      description: "Initial height. The field grows with its content.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  decorators: [],
  render: () => (
    <StateMatrix
      rows={["Text"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(_row, state) => (
        <Textarea
          aria-label={`Your question, ${state}`}
          defaultValue="Why does the job stay pending?"
          disabled={state === "disabled"}
          aria-invalid={state === "error" ? true : undefined}
          {...frozen(state)}
        />
      )}
    />
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <Textarea
      aria-label="Your question"
      defaultValue={
        "Our release was rolled back after the Postgres migration locked the payments table for four minutes. " +
        "I need to know whether adding the index concurrently is safe when a foreign key is pending, " +
        "and how to test it on a copy of production data before the next release window."
      }
    />
  ),
};

export const TypeMultiline: Story = {
  name: "Interaction: type several lines",
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByLabelText("Your question");

    await userEvent.type(textarea, "Line one{Enter}Line two");

    expect(textarea).toHaveValue("Line one\nLine two");
  },
};
