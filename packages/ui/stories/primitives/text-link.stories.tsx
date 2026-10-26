import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { TextLink } from "@devmentor/ui/frontend/text-link";

import { frozen, StateMatrix } from "../../.storybook/docs/states";

const meta = {
  title: "Primitives/Text link",
  component: TextLink,
  args: { href: "/mentors/anna-kowalska", children: "Anna Kowalska's profile" },
  argTypes: {
    external: {
      control: "boolean",
      description: "Opens in a new tab and says so to screen readers.",
    },
    href: { control: "text", description: "Destination." },
  },
} satisfies Meta<typeof TextLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-within-group">
      <TextLink href="/mentors/anna-kowalska">Internal link</TextLink>
      <TextLink href="https://github.com/example/react-query-demo" external>
        Public work on GitHub
      </TextLink>
    </div>
  ),
};

export const InSentence: Story = {
  name: "In a sentence",
  render: () => (
    <p className="max-w-prose text-conversation">
      A mentee who cancels at least two hours before the start is refunded in
      full. <TextLink href="/cancellation">Read the cancellation rule</TextLink>{" "}
      before you book.
    </p>
  ),
};

export const StateMatrixStory: Story = {
  name: "State matrix",
  parameters: { layout: "padded" },
  render: () => (
    <StateMatrix
      rows={["Link"]}
      states={["default", "hover", "focus", "pressed"]}
      render={(_row, state) => (
        <TextLink href="/mentors" {...frozen(state)}>
          All mentors
        </TextLink>
      )}
    />
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <p className="w-full max-w-80 text-conversation break-words">
      Public work:{" "}
      <TextLink
        href="https://github.com/example/very-long-repository-name-for-the-database-migration-tool"
        external
      >
        github.com/example/very-long-repository-name-for-the-database-migration-tool
      </TextLink>
    </p>
  ),
};

export const KeyboardAndExternal: Story = {
  name: "Interaction: keyboard focus and external link",
  render: () => (
    <TextLink href="https://github.com/example/react-query-demo" external>
      Public work on GitHub
    </TextLink>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", {
      name: "Public work on GitHub (opens in a new tab)",
    });

    await userEvent.tab();

    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  },
};
