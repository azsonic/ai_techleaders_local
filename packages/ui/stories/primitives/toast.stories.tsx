import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import { ToastProvider, useToast } from "@devmentor/ui/components/ui/toast";

const framed = { docs: { story: { inline: false, height: "260px" } } };

const SaveButton = ({
  title,
  description,
  timeout,
}: {
  title: string;
  description?: string;
  timeout?: number;
}) => {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => toast.add({ title, description, timeout })}
    >
      Save availability
    </Button>
  );
};

const ToastDemo = ({
  title = "Availability saved",
  description = "Mentees see the new windows now.",
  timeout,
}: {
  title?: string;
  description?: string;
  timeout?: number;
}) => (
  <ToastProvider>
    <SaveButton title={title} description={description} timeout={timeout} />
  </ToastProvider>
);

const meta = {
  title: "Primitives/Toast",
  component: ToastDemo,
  parameters: { layout: "centered", ...framed },
  argTypes: {
    title: { control: "text", description: "What was saved, in a few words." },
    description: {
      control: "text",
      description:
        "Optional second line. Leave empty when the title is enough.",
    },
    timeout: {
      control: "number",
      description:
        "Milliseconds before it closes. 0 keeps it until closed. Default 8000.",
    },
  },
} satisfies Meta<typeof ToastDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TitleOnly: Story = {
  name: "Variant: title only",
  args: { title: "Profile saved", description: "" },
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  args: {
    title: "Availability saved for the Tuesday evening block in Europe/Warsaw",
    description:
      "Mentees in other time zones see these windows converted to their own local time on your profile and in the booking summary.",
  },
  parameters: {
    layout: "centered",
    viewport: { defaultViewport: "mobile1" },
    docs: { story: { inline: false, height: "340px" } },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Save availability" }),
    );
  },
};

export const ShownOpen: Story = {
  name: "State: shown",
  args: { timeout: 0 },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Save availability" }),
    );
  },
};

export const ConfirmsAfterAction: Story = {
  name: "Interaction: appears after the action and closes with the button",
  args: { timeout: 0 },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Save availability" }),
    );

    const region = await within(document.body).findByRole("region", {
      name: "Notifications",
    });
    expect(await within(region).findByText("Availability saved")).toBeVisible();

    const close = region.querySelector(
      "[data-slot=toast-close]",
    ) as HTMLElement;
    await userEvent.click(close);
    await waitFor(() =>
      expect(within(region).queryByText("Availability saved")).toBeNull(),
    );
  },
};
