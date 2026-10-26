import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "@devmentor/ui/backend/feedback/empty-state";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";
import { ProfileForm } from "@devmentor/ui/components/mentors/profile-form";
import { ShareLink } from "@devmentor/ui/components/mentors/share-link";
import { Skeleton } from "@devmentor/ui/components/ui/skeleton";
import { Button } from "@devmentor/ui/components/ui/button";

import { ScreenFrame } from "../../../.storybook/docs/screen";
import { mockApiCall } from "../../../.storybook/docs/mock-api";

type ProfileState = "new" | "listed" | "loading" | "load-error" | "no-profile";

const save = (values: unknown) =>
  mockApiCall("success", "/api/mentors/profile", values);

/* Mentor profile page, /mentor/profile (E01-S01). */
const ProfileScreen = ({ state }: { state: ProfileState }) => (
  <ScreenFrame width="prose">
    <h1 className="text-heading-page font-emphasis">Your profile</h1>
    {state === "loading" && (
      <div className="flex flex-col gap-within-group">
        <LoadingMessage label="Loading your profile…" />
        <div aria-hidden className="flex flex-col gap-within-group">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-control w-full" />
          <Skeleton className="h-control w-full" />
        </div>
      </div>
    )}
    {state === "load-error" && (
      <ErrorMessage
        title="Your profile did not load"
        message="Nothing was changed. Try again."
        action={
          <Button variant="secondary" size="dense">
            Try again
          </Button>
        }
      />
    )}
    {state === "no-profile" && (
      <EmptyState
        title="You have no mentor profile yet"
        description="A profile is created when you accept an invitation. Ask the person who invited you for a link."
      />
    )}
    {state === "new" && <ProfileForm canList={false} onSubmit={save} />}
    {state === "listed" && (
      <>
        <ShareLink url="https://devmentor.example/mentors/anna-kowalska" />
        <ProfileForm
          canList
          onSubmit={save}
          initialValues={{
            experience:
              "Ten years of TypeScript in fintech. I review architecture and unblock debugging sessions.",
            stacks: ["typescript", "react"],
            price25: "120",
            price50: "220",
            listed: true,
          }}
        />
      </>
    )}
  </ScreenFrame>
);

const meta = {
  title: "Product/E01 Mentor supply/Screens/Profile",
  component: ProfileScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ProfileScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewMentor: Story = {
  name: "New mentor (nothing saved)",
  args: { state: "new" },
};
export const Listed: Story = {
  name: "Saved and listed, with share link",
  args: { state: "listed" },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = {
  name: "Error",
  args: { state: "load-error" },
};
export const NoProfile: Story = {
  name: "Signed-in user with no profile",
  args: { state: "no-profile" },
};
