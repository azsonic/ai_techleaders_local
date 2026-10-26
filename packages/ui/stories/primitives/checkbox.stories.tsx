import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Checkbox } from "@devmentor/ui/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@devmentor/ui/components/ui/field";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  args: { "aria-label": "TypeScript" },
  argTypes: {
    checked: { control: "boolean", description: "Controlled state." },
    defaultChecked: {
      control: "boolean",
      description: "Initial state when uncontrolled.",
    },
    indeterminate: {
      control: "boolean",
      description: "Mixed state for a parent of partly chosen options.",
    },
    disabled: {
      control: "boolean",
      description: "Unavailable. Say why in the hint.",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const StacksGroup: Story = {
  name: "Group: stacks on a mentor profile",
  parameters: { layout: "padded" },
  render: () => (
    <FieldSet>
      <FieldLegend>Stacks you can help with</FieldLegend>
      <FieldGroup>
        {["TypeScript", "React", "Python", "AI agents"].map((stack, index) => (
          <Field key={stack} orientation="horizontal">
            <Checkbox defaultChecked={index < 2} />
            <FieldLabel>{stack}</FieldLabel>
          </Field>
        ))}
        <Field orientation="horizontal">
          <Checkbox disabled />
          <FieldContent>
            <FieldLabel>Go</FieldLabel>
            <FieldDescription>Not covered in the pilot.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  render: () => (
    <StateMatrix
      rows={["Unchecked", "Checked", "Indeterminate"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(row, state) => (
        <Checkbox
          aria-label={`${row}, ${state}`}
          defaultChecked={row === "Checked"}
          indeterminate={row === "Indeterminate"}
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
  parameters: { viewport: { defaultViewport: "mobile1" }, layout: "padded" },
  render: () => (
    <div className="w-full max-w-80">
      <Field orientation="horizontal">
        <Checkbox />
        <FieldLabel>
          I understand that a mentor can cancel the session and that a full
          refund is due in that case, as described in the cancellation rule
        </FieldLabel>
      </Field>
    </div>
  ),
};

export const ToggleWithClickAndSpace: Story = {
  name: "Interaction: toggle with click, label and Space",
  render: () => (
    <Field orientation="horizontal">
      <Checkbox />
      <FieldLabel>React</FieldLabel>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole("checkbox", { name: "React" });

    await userEvent.tab();
    expect(box).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    expect(box).not.toBeChecked();

    await userEvent.click(box);
    expect(box).toBeChecked();

    await userEvent.click(canvas.getByText("React"));
    expect(box).not.toBeChecked();
  },
};
