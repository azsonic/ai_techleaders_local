import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ProfileForm } from "@devmentor/ui/components/mentors/profile-form";

import {
  API_MODES,
  mockApiCall,
  type ApiMode,
} from "../../../.storybook/docs/mock-api";

const save = (mode: ApiMode) => (values: unknown) =>
  mockApiCall(mode, "/api/mentors/profile", values, {
    price25: ["Enter a price from 90 to 600 PLN."],
  });

const meta = {
  title: "Product/E01 Mentor supply/Profile form",
  component: ProfileForm,
  parameters: { layout: "padded" },
  args: { canList: false, onSubmit: save("success") },
} satisfies Meta<typeof ProfileForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewMentor: Story = {
  name: "Data: new mentor (empty, cannot list yet)",
};

export const ReadyToList: Story = {
  name: "Data: saved profile that can be listed",
  args: {
    canList: true,
    initialValues: {
      experience:
        "Ten years of TypeScript in fintech. I review architecture and unblock debugging sessions.",
      stacks: ["typescript", "react"],
      price25: "120",
      price50: "220",
      listed: true,
    },
  },
};

export const LongTextNarrow: Story = {
  name: "Data: long text, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    canList: true,
    initialValues: {
      experience:
        "I have maintained a large React and TypeScript monorepo for a payments company for ten years. ".repeat(
          6,
        ),
      stacks: ["typescript", "react", "python", "ai-agents"],
      price25: "120",
      price50: "220",
      listed: false,
    },
  },
};

export const ApiResponses: Story = {
  name: "API responses (all five)",
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex flex-col gap-section">
      {API_MODES.map(({ mode, label }) => (
        <section
          key={mode}
          aria-label={label}
          className="flex flex-col gap-within-group border-t border-border pt-between-groups"
        >
          <h3 className="text-interface font-emphasis">{label}</h3>
          <ProfileForm
            {...args}
            canList
            initialValues={{
              experience: "",
              stacks: ["python"],
              price25: "120",
              price50: "220",
              listed: false,
            }}
            onSubmit={save(mode)}
          />
        </section>
      ))}
    </div>
  ),
};

export const ValidatesOnBlurAndSubmit: Story = {
  name: "Interaction: error on blur, focus on first error, no request",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const price = canvas.getByLabelText(/Price for 25 minutes/);

    await userEvent.type(price, "50");
    await userEvent.tab();
    expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a price from 90 to 600 PLN.",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));
    expect(price).toHaveFocus();
  },
};

export const SavesAndConfirms: Story = {
  name: "Interaction: success shows only after the server answered",
  args: { onSubmit: save("success") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/Price for 25 minutes/), "120");
    await userEvent.click(canvas.getByRole("button", { name: "Save profile" }));

    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("Profile saved"),
    );
  },
};
