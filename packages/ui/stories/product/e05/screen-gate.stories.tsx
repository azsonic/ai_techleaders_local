import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import {
  GateStatus,
  type GateState,
} from "@devmentor/ui/components/operator/gate-status";
import { Button } from "@devmentor/ui/components/ui/button";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { ScreenFrame } from "../../../.storybook/docs/screen";

type GateScreenState =
  | "collecting"
  | "almost"
  | "open"
  | "stopped"
  | "nothing-yet"
  | "loading"
  | "load-error";

const COUNTS: Record<
  "collecting" | "almost" | "open" | "stopped",
  { state: GateState; invited: number; accepted: number; published: number }
> = {
  collecting: { state: "closed", invited: 20, accepted: 7, published: 2 },
  almost: { state: "closed", invited: 20, accepted: 9, published: 4 },
  open: { state: "open", invited: 20, accepted: 9, published: 5 },
  stopped: { state: "stopped", invited: 20, accepted: 6, published: 3 },
};

/*
 * Supply gate, /admin/gate (E05-S01, D12, D16, D24). Proposal: no E05 specification exists. The gate decides whether paid
 * booking can open (R06); the operator only reads it. "Published" means both prices, one stack and a bookable slot at least
 * two hours ahead.
 */
const GateScreen = ({ state }: { state: GateScreenState }) => (
  <ScreenFrame>
    <h1 className="text-heading-page font-emphasis">Supply gate</h1>
    {state === "loading" && (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Loading the gate status…" />
        <div aria-hidden>
          <Skeleton className="h-40 w-full max-w-prose" />
        </div>
      </div>
    )}
    {state === "load-error" && (
      <ErrorMessage
        title="The gate status did not load"
        message="Nothing was changed. Try again."
        action={
          <Button variant="secondary" size="dense">
            Try again
          </Button>
        }
      />
    )}
    {state === "nothing-yet" && (
      <EmptyState
        title="No invitations sent yet"
        description="The gate counts invited, accepted and published mentors. Send the first invitations to start it."
        action={
          <a href="/admin/invitations" className={textLinkClassName}>
            Go to invitations
          </a>
        }
      />
    )}
    {(state === "collecting" ||
      state === "almost" ||
      state === "open" ||
      state === "stopped") && (
      <div className="flex max-w-prose flex-col gap-between-groups">
        <GateStatus {...COUNTS[state]} />
        <p className="text-interface">
          <a href="/admin/invitations" className={textLinkClassName}>
            Manage invitations
          </a>
        </p>
      </div>
    )}
  </ScreenFrame>
);

const meta = {
  title: "Product/E05 Supply gate and pilot/Screens/Gate",
  component: GateScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "collecting" },
} satisfies Meta<typeof GateScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collecting: Story = { name: "Closed: 2 of 5 published" };
export const Almost: Story = {
  name: "Closed: one mentor short",
  args: { state: "almost" },
};
export const Open: Story = { name: "Open", args: { state: "open" } };
export const Stopped: Story = { name: "Stopped", args: { state: "stopped" } };
export const NothingYet: Story = {
  name: "No invitations yet",
  args: { state: "nothing-yet" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
