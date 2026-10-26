import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ShareLink } from "@devmentor/ui/components/mentors/share-link";

const meta = {
  title: "Product/E01 Mentor supply/Share link",
  component: ShareLink,
  parameters: { layout: "padded" },
  args: { url: "https://devmentor.example/mentors/anna-kowalska" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-prose">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LongLinkNarrow: Story = {
  name: "Data: long link, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    url: "https://devmentor.example/mentors/aleksandra-wisniewska-kowalczyk-nowak-12",
  },
};

export const CopyConfirmed: Story = {
  name: "State: copied",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });

    await userEvent.click(canvas.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("Link copied."),
    );
  },
};

export const CopyFailed: Story = {
  name: "State: copy failed",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error("denied")) },
    });

    await userEvent.click(canvas.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(canvas.getByRole("alert")).toHaveTextContent(
        "Could not copy. Select the link and copy it yourself.",
      ),
    );
  },
};
