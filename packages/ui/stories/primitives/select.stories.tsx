import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@devmentor/ui/components/ui/select";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const TIMES = ["10:00", "10:25", "10:50", "11:15", "11:40"];

const TimeSelect = ({
  label = "Start time",
  density,
  disabled,
  invalid,
  defaultValue,
  preview,
}: {
  label?: string;
  density?: "default" | "dense";
  disabled?: boolean;
  invalid?: boolean;
  defaultValue?: string;
  preview?: Record<string, string>;
}) => (
  <Select defaultValue={defaultValue} disabled={disabled}>
    <SelectTrigger
      aria-label={label}
      density={density}
      aria-invalid={invalid || undefined}
      {...preview}
    >
      <SelectValue placeholder="Choose a start time" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Europe/Warsaw</SelectLabel>
        {TIMES.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

const meta = {
  title: "Primitives/Select",
  component: TimeSelect,
  argTypes: {
    density: {
      control: "select",
      options: ["default", "dense"],
      description: "default 40px; dense 32px.",
    },
    disabled: {
      control: "boolean",
      description: "Unavailable. Say why in the hint.",
    },
    invalid: {
      control: "boolean",
      description: "Marks the control invalid. Pair with an error message.",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Densities: Story = {
  render: () => (
    <div className="flex w-64 max-w-full flex-col gap-within-group">
      <TimeSelect label="Default density" defaultValue="10:00" />
      <TimeSelect label="Dense density" density="dense" defaultValue="10:00" />
    </div>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  decorators: [],
  render: () => (
    <StateMatrix
      rows={["Select"]}
      states={["default", "hover", "focus", "disabled", "error"]}
      render={(_row, state) => (
        <div className="w-48">
          <TimeSelect
            label={`Start time, ${state}`}
            defaultValue="10:25"
            disabled={state === "disabled"}
            invalid={state === "error"}
            preview={frozen(state) as Record<string, string>}
          />
        </div>
      )}
    />
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-60 max-w-full">
      <Select defaultValue="long">
        <SelectTrigger aria-label="Mentor">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="long">
            Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ChooseWithKeyboard: Story = {
  name: "Interaction: choose an option with the keyboard",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", {
      name: "Start time",
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    const list = await within(document.body).findByRole("listbox");
    expect(list).toBeVisible();

    await userEvent.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(trigger).toHaveTextContent("10:25"));
  },
};
