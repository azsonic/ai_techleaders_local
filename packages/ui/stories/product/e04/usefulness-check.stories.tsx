import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { UsefulnessCheck } from "@devmentor/ui/components/sessions/usefulness-check";

import { LONG_AUTHOR } from "../../../.storybook/docs/e04-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";

const Demo = ({
  mode = "success",
  ...props
}: Omit<Parameters<typeof UsefulnessCheck>[0], "onSubmit"> & {
  mode?: ApiMode;
}) => (
  <div className="w-full max-w-prose">
    <UsefulnessCheck
      {...props}
      onSubmit={(answer) =>
        mockApiCall(mode, "/api/sessions/s1/usefulness", { answer })
      }
    />
  </div>
);

const meta = {
  title: "Product/E04 Text session/Usefulness check",
  component: Demo,
  parameters: { layout: "padded" },
  args: { mentorName: "Anna Kowalska" },
  argTypes: {
    answered: {
      control: "select",
      options: [undefined, "yes", "no"],
      description:
        "Set when the mentee already answered; shows the answer as text.",
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AlreadyAnswered: Story = {
  name: "State: already answered",
  args: { answered: "yes" },
};

export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { mentorName: LONG_AUTHOR },
};

const answered = (
  mode: ApiMode,
  name: string,
  expected: string,
  role: "alert" | "status",
): Story => ({
  name,
  args: { mode },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("radio", { name: "Yes, it arrived in time" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Send answer" }));
    if (expected === "busy")
      await waitFor(() =>
        expect(
          canvas.getByRole("button", { name: "Sending…" }),
        ).toHaveAttribute("aria-busy", "true"),
      );
    else
      await waitFor(() =>
        expect(canvas.getByRole(role)).toHaveTextContent(expected),
      );
  },
});

export const Pending = answered(
  "pending",
  "Sending (pending)",
  "busy",
  "status",
);
export const ServerError = answered(
  "server-error",
  "Server error: the form is kept",
  "Your answer was not saved",
  "alert",
);
export const Offline = answered(
  "offline",
  "Offline: the form is kept",
  "The server did not answer",
  "alert",
);
export const Saved = answered(
  "success",
  "Saved, after the server confirmed",
  "Thank you. Your answer is saved.",
  "status",
);

export const NothingChosen: Story = {
  name: "Interaction: no answer is refused and the first option is focused",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send answer" }));
    expect(canvas.getByRole("alert")).toHaveTextContent("Choose an answer.");
    expect(canvas.getAllByRole("radio")[0]).toHaveFocus();
  },
};

export const KeyboardAnswer: Story = {
  name: "Interaction: arrow keys choose, Enter sends",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getAllByRole("radio")[0].focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(
      canvas.getByRole("radio", { name: "No, it arrived too late" }),
    ).toBeChecked();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent(
        "Your answer is saved",
      ),
    );
  },
};
