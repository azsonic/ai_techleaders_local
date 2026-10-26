import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Badge } from "@devmentor/ui/components/ui/badge";
import { Button } from "@devmentor/ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/ui/card";

const BookingCard = ({
  size,
  onCancel,
}: {
  size?: "default" | "sm";
  onCancel?: () => void;
}) => (
  <Card size={size} className="w-96 max-w-full">
    <CardHeader>
      <CardTitle>Tuesday, 14:00 · 25 minutes</CardTitle>
      <CardDescription>with Anna Kowalska</CardDescription>
      <CardAction>
        <Badge>Confirmed</Badge>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>
        My Postgres migration locks the payments table. Is adding the index
        concurrently safe here?
      </p>
    </CardContent>
    <CardFooter className="justify-between gap-within-group">
      <span className="text-muted-foreground">90 PLN</span>
      <Button variant="destructive" size="dense" onClick={onCancel}>
        Cancel booking
      </Button>
    </CardFooter>
  </Card>
);

const meta = {
  title: "Primitives/Card",
  component: Card,
  parameters: { layout: "padded" },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
      description:
        "default: 16px padding. sm: 12px, for compact browsing panels.",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <BookingCard size={args.size} />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-between-groups">
      <BookingCard />
      <BookingCard size="sm" />
    </div>
  ),
};

export const WithoutFooter: Story = {
  name: "Header and content only",
  render: () => (
    <Card className="w-96 max-w-full">
      <CardHeader>
        <CardTitle>Anna Kowalska</CardTitle>
        <CardDescription>TypeScript, React · from 90 PLN</CardDescription>
      </CardHeader>
      <CardContent>Next free slot: Tuesday, 14:00.</CardContent>
    </Card>
  ),
};

export const LongContentNarrow: Story = {
  name: "Long content, narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <Card className="w-full max-w-80">
      <CardHeader>
        <CardTitle>
          Wednesday, 11:15 · 50 minutes with Aleksandra
          Wiśniewska-Kowalczyk-Nowak
        </CardTitle>
        <CardDescription>
          Cancelled by the mentor: the question was out of scope for a text
          session
        </CardDescription>
        <CardAction>
          <Badge variant="destructive">Cancelled</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="break-words">
        https://github.com/example/very-long-repository-name-for-the-database-migration-tool/pull/1234
      </CardContent>
    </Card>
  ),
};

export const ReachActionByKeyboard: Story = {
  name: "Interaction: the action inside is reachable by keyboard",
  args: {},
  render: () => {
    const onCancel = fn();
    return <BookingCard onCancel={onCancel} />;
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Cancel booking",
    });

    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(button).toBeVisible();
  },
};
