import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Input } from "@devmentor/ui/components/ui/input";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const meta = {
  title: "Primitives/Text input",
  component: Input,
  args: { "aria-label": "Display name", placeholder: "Anna Kowalska" },
  argTypes: {
    density: {
      control: "select",
      options: ["default", "dense"],
      description: "default 40px for forms; dense 32px for filters and tables.",
    },
    disabled: {
      control: "boolean",
      description: "Unavailable. Say why in the hint.",
    },
    type: {
      control: "select",
      options: ["text", "email", "search", "url", "number"],
      description: "Native input type.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Densities: Story = {
  render: () => (
    <div className="flex w-72 max-w-full flex-col gap-within-group">
      <Input aria-label="Default density" defaultValue="Default 40px" />
      <Input
        aria-label="Dense density"
        density="dense"
        defaultValue="Dense 32px"
      />
    </div>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  decorators: [],
  render: () => (
    <StateMatrix
      rows={["Text"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(_row, state) => (
        <Input
          aria-label={`Display name, ${state}`}
          defaultValue="Anna Kowalska"
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
    <Input
      aria-label="Link to public work"
      defaultValue="https://github.com/example/very-long-repository-name-for-the-database-migration-tool/pull/1234"
    />
  ),
};

export const TypeAndTab: Story = {
  name: "Interaction: type, then leave the field",
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("Display name");

    await userEvent.type(input, "Jan Nowak");
    expect(input).toHaveValue("Jan Nowak");

    await userEvent.tab();
    expect(input).not.toHaveFocus();
  },
};
