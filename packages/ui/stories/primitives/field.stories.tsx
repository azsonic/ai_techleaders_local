import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@devmentor/ui/components/ui/field";
import { Input } from "@devmentor/ui/components/ui/input";
import { Textarea } from "@devmentor/ui/components/ui/textarea";

const PriceField = ({ initial = "" }: { initial?: string }) => {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  const price = Number(value);
  const error =
    touched &&
    (value === "" || Number.isNaN(price) || price < 90 || price > 600)
      ? "Enter a price from 90 to 600 PLN."
      : undefined;

  return (
    <Field>
      <FieldLabel>Price for 25 minutes (PLN)</FieldLabel>
      <Input
        inputMode="numeric"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
      />
      <FieldDescription>
        Between 90 and 600 PLN. DevMentor keeps 20%.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
};

const meta = {
  title: "Primitives/Form field",
  component: Field,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Field>
      <FieldLabel>Display name</FieldLabel>
      <Input defaultValue="Anna Kowalska" />
      <FieldDescription>Shown on your public profile.</FieldDescription>
    </Field>
  ),
};

export const Parts: Story = {
  name: "Required, optional and error",
  render: () => (
    <FieldGroup>
      <Field>
        <FieldLabel>Display name</FieldLabel>
        <Input defaultValue="Anna Kowalska" />
      </Field>
      <Field>
        <FieldLabel optional>Link to public work</FieldLabel>
        <Input type="url" />
        <FieldDescription>
          For example a repository or an article.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Your question</FieldLabel>
        <Textarea defaultValue="" />
        <FieldError>Write your question so the mentor can prepare.</FieldError>
      </Field>
    </FieldGroup>
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <Field>
      <FieldLabel>
        Short description of the problem you want help with during this session
      </FieldLabel>
      <Input defaultValue="" />
      <FieldDescription>
        The mentor sees this before the session starts, so name the technology,
        the error and what you already tried. Plain text only.
      </FieldDescription>
      <FieldError>
        Describe the problem in at least one sentence so the mentor can prepare.
      </FieldError>
    </Field>
  ),
};

export const ValidateOnBlur: Story = {
  name: "Interaction: validate when leaving the field",
  render: () => <PriceField />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Price for 25 minutes (PLN)");

    expect(canvas.queryByRole("alert")).toBeNull();

    await userEvent.type(input, "50");
    await userEvent.tab();

    const error = await canvas.findByRole("alert");
    expect(error).toHaveTextContent("Enter a price from 90 to 600 PLN.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/90 and 600 PLN.*Enter a price/);

    await userEvent.clear(input);
    await userEvent.type(input, "150");
    await userEvent.tab();

    expect(canvas.queryByRole("alert")).toBeNull();
    expect(input).not.toHaveAttribute("aria-invalid");
  },
};
