import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@devmentor/ui/components/ui/field";
import { Switch } from "@devmentor/ui/components/ui/switch";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  args: { "aria-label": "Listed in the directory" },
  argTypes: {
    checked: { control: "boolean", description: "Controlled state." },
    defaultChecked: {
      control: "boolean",
      description: "Initial state when uncontrolled.",
    },
    disabled: {
      control: "boolean",
      description: "Unavailable. Say why next to the switch.",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ProfileVisibility: Story = {
  name: "Profile visibility, off until the profile is complete",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-prose flex-col gap-between-groups">
      <Field orientation="horizontal">
        <Switch disabled />
        <FieldContent>
          <FieldLabel>Listed in the directory</FieldLabel>
          <FieldDescription>
            Save both prices and at least one stack first. Your share link works
            either way.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <Switch defaultChecked />
        <FieldContent>
          <FieldLabel>Listed in the directory</FieldLabel>
          <FieldDescription>
            Mentees can find you in the directory.
          </FieldDescription>
        </FieldContent>
      </Field>
    </div>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  render: () => (
    <StateMatrix
      rows={["Off", "On"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(row, state) => (
        <Switch
          aria-label={`${row}, ${state}`}
          defaultChecked={row === "On"}
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
        <Switch />
        <FieldLabel>
          Show my profile in the directory so that mentees who do not have my
          link can find me
        </FieldLabel>
      </Field>
    </div>
  ),
};

export const ToggleWithClickAndSpace: Story = {
  name: "Interaction: toggle with click, label and Space",
  render: () => (
    <Field orientation="horizontal">
      <Switch />
      <FieldLabel>Listed in the directory</FieldLabel>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", {
      name: "Listed in the directory",
    });

    await userEvent.tab();
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    expect(toggle).toBeChecked();

    await userEvent.click(canvas.getByText("Listed in the directory"));
    expect(toggle).not.toBeChecked();
  },
};
