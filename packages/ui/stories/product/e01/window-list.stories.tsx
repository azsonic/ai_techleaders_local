import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { WindowList } from "@devmentor/ui/components/availability/window-list";

import { MANY_WINDOWS, WINDOWS } from "../../../.storybook/docs/e01-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";

const remove = (mode: ApiMode) => (id: string) =>
  mockApiCall(mode, `/api/mentors/availability/${id}`);

const meta = {
  title: "Product/E01 Mentor supply/Window list",
  component: WindowList,
  parameters: { layout: "padded" },
  args: { windows: WINDOWS, onRemove: remove("success") },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WindowList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = {
  name: "Data: loading",
  args: { windows: undefined, loading: true },
};

export const Empty: Story = {
  name: "Data: empty (nothing here yet)",
  args: { windows: [] },
};

export const LoadError: Story = {
  name: "Data: error",
  args: { windows: undefined, error: true, onRetry: () => undefined },
};

export const ManyWindows: Story = {
  name: "Data: lots (20 windows)",
  args: { windows: MANY_WINDOWS },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { windows: MANY_WINDOWS.slice(0, 3) },
};

const openDialog = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getAllByRole("button", { name: /^Remove window/ })[0],
  );
  return within(document.body).findByRole("alertdialog");
};

export const RemoveAndConfirm: Story = {
  name: "Interaction: question names the window, Cancel first, closes after the server answered",
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    expect(dialog).toHaveAccessibleName("Remove Fri 13 Nov, 10:00 to 12:00?");
    const buttons = within(dialog).getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Keep window");
    await waitFor(() => expect(buttons[0]).toHaveFocus());

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Remove window" }),
    );

    await waitFor(() =>
      expect(within(document.body).queryByRole("alertdialog")).toBeNull(),
    );
  },
};

const dialogStory = (
  mode: ApiMode,
  name: string,
  expected?: string,
): Story => ({
  name,
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  args: { onRemove: remove(mode) },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Remove window" }),
    );
    if (expected)
      await waitFor(() => expect(dialog).toHaveTextContent(expected));
    else
      await waitFor(() =>
        expect(
          within(dialog).getByRole("button", { name: "Removing…" }),
        ).toBeVisible(),
      );
  },
});

export const DialogPending = dialogStory(
  "pending",
  "Dialog: removing (pending)",
);
export const DialogServerError = dialogStory(
  "server-error",
  "Dialog: server error",
  "Something broke on our side",
);
export const DialogOffline = dialogStory(
  "offline",
  "Dialog: offline",
  "The server did not answer",
);

export const DialogOpen: Story = {
  name: "Dialog: open question",
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement);
    expect(dialog).toBeVisible();
  },
};
