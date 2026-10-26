import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "@devmentor/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/ui/card";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";

const RowSkeleton = () => (
  <div className="flex items-center gap-within-group py-within-group">
    <Skeleton className="size-control-dense" />
    <div className="flex flex-1 flex-col gap-inline">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <Skeleton className="h-control-min w-20" />
  </div>
);

const LoadingBookings = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex w-96 max-w-full flex-col gap-between-groups">
      <Button variant="secondary" size="dense" onClick={() => setLoaded(true)}>
        Finish loading
      </Button>
      <section
        aria-busy={!loaded}
        aria-label="My bookings"
        className="flex flex-col"
      >
        {loaded ? (
          <ul className="text-interface">
            <li className="py-within-group">
              Tuesday, 14:00 · 25 minutes · Anna Kowalska
            </li>
            <li className="py-within-group">
              Wednesday, 11:15 · 50 minutes · Jan Nowak
            </li>
          </ul>
        ) : (
          <>
            <LoadingMessage label="Loading your bookings…" />
            <RowSkeleton />
            <RowSkeleton />
          </>
        )}
      </section>
    </div>
  );
};

const meta = {
  title: "Primitives/Loading skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  argTypes: {
    className: {
      control: "text",
      description: "Size and shape, for example h-4 w-24.",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { className: "h-4 w-48" } };

export const ListRows: Story = {
  name: "List rows",
  render: () => (
    <div className="w-96 max-w-full">
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  name: "Card",
  render: () => (
    <Card className="w-96 max-w-full">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-2/3" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-within-group">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  ),
};

export const LongContentNarrow: Story = {
  name: "Narrow screen",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="w-full max-w-80">
      <RowSkeleton />
      <RowSkeleton />
    </div>
  ),
};

export const BusyThenLoaded: Story = {
  name: "Interaction: busy while loading, content afterwards",
  render: () => <LoadingBookings />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByLabelText("My bookings");

    expect(region).toHaveAttribute("aria-busy", "true");
    expect(canvas.getByRole("status")).toHaveTextContent(
      "Loading your bookings…",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Finish loading" }),
    );

    expect(region).toHaveAttribute("aria-busy", "false");
    expect(canvas.queryByRole("status")).toBeNull();
    expect(canvas.getByText(/Anna Kowalska/)).toBeVisible();
  },
};
