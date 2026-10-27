import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  FAVORITES,
  MANY_FAVORITES,
} from "../../../.storybook/docs/favorites-data";
import { FavoritesDemo } from "../../../.storybook/docs/favorites-demo";

const meta = {
  title: "Product/Favorites/Favorite mentors",
  component: FavoritesDemo,
  parameters: { layout: "padded" },
  args: { all: FAVORITES },
} satisfies Meta<typeof FavoritesDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

const removeButtons = (canvas: ReturnType<typeof within>) =>
  canvas.getAllByRole("button", { name: /^Remove from favorites/ });

export const Playground: Story = {};

export const Loading: Story = {
  name: "Data: loading",
  args: { all: undefined, loading: true },
};

export const NothingSavedYet: Story = {
  name: "Data: nothing saved yet",
  args: { all: [] },
};

export const NoResultsForFilters: Story = {
  name: "Data: no results for these filters",
  args: { initial: ["ai-agents"], all: FAVORITES.slice(0, 1) },
};

export const LoadError: Story = {
  name: "Data: error",
  args: { all: undefined, error: true, onRetry: () => undefined },
};

export const PartialData: Story = {
  name: "Data: partial (no headline, no stacks)",
  args: {
    all: [
      FAVORITES[0],
      { ...FAVORITES[1], headline: undefined },
      { ...FAVORITES[2], stacks: [] },
    ],
  },
};

export const ManyMentors: Story = {
  name: "Data: lots (30 mentors)",
  args: { all: MANY_FAVORITES },
};

export const LongText: Story = {
  name: "Data: long name and headline",
  args: {
    all: [
      {
        id: "long",
        displayName: "Aleksandra Wiśniewska-Kowalczykowska-Przybylska",
        headline:
          "Principal engineer and engineering manager with a very long headline that has to wrap on a narrow screen without breaking the card or hiding the remove action from the person",
        stacks: ["typescript", "react", "python", "ai-agents"],
        href: "/mentors/aleksandra",
      },
    ],
  },
};

export const NarrowScreen: Story = {
  name: "Data: narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const RemovePending: Story = {
  name: "State: removing (only that card is pending)",
  args: { remove: "pending" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(removeButtons(canvas)[0]);
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /^Removing/ })).toBeVisible(),
    );
    expect(removeButtons(canvas)).toHaveLength(3);
  },
};

export const RemoveServerError: Story = {
  name: "State: remove failed (server)",
  args: { remove: "server-error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(removeButtons(canvas)[0]);
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    expect(canvas.getByRole("status")).toHaveTextContent("4 mentors");
  },
};

export const RemoveOffline: Story = {
  name: "State: remove failed (offline)",
  args: { remove: "offline" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(removeButtons(canvas)[0]);
    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "The server did not answer",
      ),
    );
  },
};

export const FilterAndRemove: Story = {
  name: "Interaction: filter, remove, focus moves to the next card",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "React" }));
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("2 mentors"),
    );

    await userEvent.click(removeButtons(canvas)[0]);
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("1 mentor"),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("link", { name: "Marta Zielińska" }),
      ).toHaveFocus(),
    );
  },
};
