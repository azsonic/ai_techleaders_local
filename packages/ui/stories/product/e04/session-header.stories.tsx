import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionHeader } from "@devmentor/ui/components/sessions/session-header";

import {
  LONG_AUTHOR,
  NOW_BEFORE,
  NOW_ENDED,
  NOW_LIVE,
  SESSION_START,
} from "../../../.storybook/docs/e04-data";

const meta = {
  title: "Product/E04 Text session/Session header",
  component: SessionHeader,
  parameters: { layout: "fullscreen" },
  args: {
    counterpartName: "Anna Kowalska",
    startsAt: SESSION_START,
    minutes: 25,
    now: NOW_LIVE,
    zone: "Europe/Warsaw",
    headingLevel: 2,
  },
  argTypes: {
    headingLevel: {
      control: "select",
      options: [1, 2],
      description:
        "1 on the session page, where this is the page heading. The stories use 2 so a documentation page keeps one h1.",
    },
    minutes: { control: "select", options: [25, 50] },
    now: {
      control: "text",
      description:
        "The current moment as an ISO string. The page passes it; the header never reads the clock.",
    },
  },
} satisfies Meta<typeof SessionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NotStarted: Story = {
  name: "State: not started",
  args: { now: NOW_BEFORE },
};
export const InProgress: Story = { name: "State: in progress" };
export const Ended: Story = { name: "State: ended", args: { now: NOW_ENDED } };

export const Fifty: Story = {
  name: "Data: 50 minutes",
  args: { minutes: 50 },
};

export const LongNameNarrow: Story = {
  name: "Data: long name, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { counterpartName: LONG_AUTHOR },
};
