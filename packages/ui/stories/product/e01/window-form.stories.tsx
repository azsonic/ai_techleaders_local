import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { WindowForm } from "@devmentor/ui/components/availability/window-form";

import { NOW } from "../../../.storybook/docs/e01-data";
import {
  API_MODES,
  mockApiCall,
  type ApiMode,
} from "../../../.storybook/docs/mock-api";

const add = (mode: ApiMode) => (values: unknown) =>
  mockApiCall(mode, "/api/mentors/availability", values, {
    end: ["Ends before it starts."],
  });

const meta = {
  title: "Product/E01 Mentor supply/Window form",
  component: WindowForm,
  parameters: { layout: "padded" },
  args: { now: NOW, onSubmit: add("success") },
} satisfies Meta<typeof WindowForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ApiResponses: Story = {
  name: "API responses (all five, plus overlap)",
  render: (args) => (
    <div className="flex flex-col gap-section">
      {[
        ...API_MODES,
        { mode: "conflict" as ApiMode, label: "Overlap (conflict)" },
      ].map(({ mode, label }) => (
        <section
          key={mode}
          aria-label={label}
          className="flex flex-col gap-within-group border-t border-border pt-between-groups"
        >
          <h3 className="text-interface font-emphasis">{label}</h3>
          <WindowForm {...args} onSubmit={add(mode)} />
        </section>
      ))}
    </div>
  ),
};

const fillIn = async (
  canvas: ReturnType<typeof within>,
  date = "2026-11-13",
  start = "10:00",
  end = "12:00",
) => {
  await userEvent.type(canvas.getByLabelText("Date"), date);
  await userEvent.type(canvas.getByLabelText("Start"), start);
  await userEvent.type(canvas.getByLabelText("End"), end);
};

export const FocusesFirstError: Story = {
  name: "Interaction: empty submit names every field and focuses the first",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Add window" }));

    expect(canvas.getAllByRole("alert")).toHaveLength(3);
    expect(canvas.getByLabelText("Date")).toHaveFocus();
  },
};

export const KeepsEntriesOnOverlap: Story = {
  name: "Interaction: a server refusal keeps what was typed",
  args: { onSubmit: add("conflict") },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillIn(canvas);

    await userEvent.click(canvas.getByRole("button", { name: "Add window" }));

    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "This window overlaps one you already have.",
      ),
    );
    expect(canvas.getByLabelText("Start")).toHaveValue("10:00");
  },
};

export const ConfirmsAndClears: Story = {
  name: "Interaction: success after the server answered, fields cleared",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillIn(canvas);

    await userEvent.click(canvas.getByRole("button", { name: "Add window" }));

    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("Window added"),
    );
    expect(canvas.getByLabelText("Date")).toHaveValue("");
  },
};

const submitWith = (mode: ApiMode): Story => ({
  args: { onSubmit: add(mode) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillIn(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "Add window" }));
  },
});

export const StatePending: Story = {
  ...submitWith("pending"),
  name: "Form state: pending (button busy, entries kept)",
  play: async (context) => {
    await submitWith("pending").play?.(context);
    const canvas = within(context.canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Adding…" })).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(canvas.getByLabelText("Start")).toHaveValue("10:00");
  },
};

export const StateFieldError: Story = {
  ...submitWith("field-error"),
  name: "Form state: field error from the server (focus moves to it)",
  play: async (context) => {
    await submitWith("field-error").play?.(context);
    const canvas = within(context.canvasElement);
    await waitFor(() => expect(canvas.getByLabelText("End")).toHaveFocus());
    expect(canvas.getByRole("alert")).toHaveTextContent(
      "Ends before it starts.",
    );
  },
};

export const StateServerError: Story = {
  ...submitWith("server-error"),
  name: "Form state: server error (entries kept)",
  play: async (context) => {
    await submitWith("server-error").play?.(context);
    const canvas = within(context.canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "Something broke on our side",
      ),
    );
    expect(canvas.getByLabelText("End")).toHaveValue("12:00");
  },
};

export const StateOffline: Story = {
  ...submitWith("offline"),
  name: "Form state: offline (entries kept)",
  play: async (context) => {
    await submitWith("offline").play?.(context);
    const canvas = within(context.canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "The server did not answer",
      ),
    );
    expect(canvas.getByLabelText("Date")).toHaveValue("2026-11-13");
  },
};

export const PreventsDoubleSubmit: Story = {
  name: "Form state: a second click while pending sends nothing",
  args: { onSubmit: fn(() => new Promise<never>(() => {})) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await fillIn(canvas);

    await userEvent.click(canvas.getByRole("button", { name: "Add window" }));
    // The busy button ignores the pointer, so press Enter in a field: the form must still send nothing.
    canvas.getByLabelText("End").focus();
    await userEvent.keyboard("{Enter}");

    expect(args.onSubmit).toHaveBeenCalledTimes(1);
  },
};
