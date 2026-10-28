import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ScreenFrame } from "../../../.storybook/docs/screen";
import { FAVORITES } from "../../../.storybook/docs/favorites-data";
import { FavoritesDemo } from "../../../.storybook/docs/favorites-demo";

/* Favorite mentors page, /favorites. Signed in as a mentee. */
const FavoritesScreen = (props: React.ComponentProps<typeof FavoritesDemo>) => (
  <ScreenFrame>
    <h1 className="text-heading-page font-emphasis">Favorite mentors</h1>
    <FavoritesDemo {...props} />
  </ScreenFrame>
);

const meta = {
  title: "Product/Favorites/Screens/Favorite mentors",
  component: FavoritesScreen,
  parameters: { layout: "fullscreen" },
  args: { all: FAVORITES },
} satisfies Meta<typeof FavoritesScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = { name: "Saved mentors with a stack filter" };
export const Loading: Story = {
  args: { all: undefined, loading: true },
};
export const NothingSavedYet: Story = {
  name: "Nothing saved yet",
  args: { all: [] },
};
export const NoResults: Story = {
  name: "No results for the filter",
  args: { all: FAVORITES.slice(0, 1), initial: ["ai-agents"] },
};
export const LoadError: Story = {
  name: "Error",
  args: { all: undefined, error: true, onRetry: () => undefined },
};
