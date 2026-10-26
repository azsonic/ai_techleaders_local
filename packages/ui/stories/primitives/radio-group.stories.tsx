import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@devmentor/ui/components/ui/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@devmentor/ui/components/ui/radio-group";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const LengthGroup = ({
  defaultValue = "25",
  disabledValue,
}: {
  defaultValue?: string;
  disabledValue?: string;
}) => (
  <FieldSet>
    <FieldLegend>Session length</FieldLegend>
    <RadioGroup defaultValue={defaultValue}>
      <Field orientation="horizontal">
        <RadioGroupItem value="25" disabled={disabledValue === "25"} />
        <FieldContent>
          <FieldLabel>25 minutes</FieldLabel>
          <FieldDescription>90 PLN</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="50" disabled={disabledValue === "50"} />
        <FieldContent>
          <FieldLabel>50 minutes</FieldLabel>
          <FieldDescription>180 PLN</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  </FieldSet>
);

const meta = {
  title: "Primitives/Radio group",
  component: RadioGroup,
  parameters: { layout: "padded" },
  argTypes: {
    defaultValue: { control: "text", description: "Initially chosen value." },
    disabled: { control: "boolean", description: "Disables every option." },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Session length">
      <Field orientation="horizontal">
        <RadioGroupItem value="25" />
        <FieldLabel>25 minutes</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="50" />
        <FieldLabel>50 minutes</FieldLabel>
      </Field>
    </RadioGroup>
  ),
  args: { defaultValue: "25" },
};

export const SessionLength: Story = {
  name: "Session length with prices",
  render: () => <LengthGroup />,
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  render: () => (
    <StateMatrix
      rows={["Unchecked", "Checked"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(row, state) => (
        <RadioGroup
          defaultValue={row === "Checked" ? "a" : ""}
          aria-label={`${row}, ${state}`}
        >
          <RadioGroupItem
            value="a"
            aria-label={`${row}, ${state}`}
            disabled={state === "disabled"}
            aria-invalid={state === "error" ? true : undefined}
            {...frozen(state)}
          />
        </RadioGroup>
      )}
    />
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-full max-w-80">
      <RadioGroup defaultValue="a" aria-label="Reason">
        <Field orientation="horizontal">
          <RadioGroupItem value="a" />
          <FieldLabel>
            The question is out of scope for a text session of this length
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="b" />
          <FieldLabel>I am unavailable at the booked time</FieldLabel>
        </Field>
      </RadioGroup>
    </div>
  ),
};

export const ChooseWithArrowKeys: Story = {
  name: "Interaction: arrow keys move the choice",
  render: () => <LengthGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("radio", { name: /25 minutes/ });
    const second = canvas.getByRole("radio", { name: /50 minutes/ });

    await userEvent.tab();
    expect(first).toHaveFocus();
    expect(first).toBeChecked();

    await userEvent.keyboard("{ArrowDown}");
    expect(second).toBeChecked();
    expect(first).not.toBeChecked();

    await userEvent.click(canvas.getByText("25 minutes"));
    expect(first).toBeChecked();
  },
};
