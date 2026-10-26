import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@devmentor/ui/components/ui/alert";
import { Button } from "@devmentor/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/ui/card";
import { TextLink } from "@devmentor/ui/frontend/text-link";

import { ScreenFrame } from "../../../.storybook/docs/screen";

type JoinState =
  | "signed-in"
  | "signed-out"
  | "accepting"
  | "already-registered"
  | "unusable"
  | "wrong-email"
  | "no-verified-email"
  | "server-error";

/* Join page, /join/[token] (E01-S01). Page composition for the story; the application page will own it. */
const JoinScreen = ({ state }: { state: JoinState }) => (
  <ScreenFrame width="prose">
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>You are invited to mentor on DevMentor</h1>
        </CardTitle>
        <CardDescription>
          DevMentor connects developers with experienced mentors for paid text
          sessions of 25 or 50 minutes. You set your prices and publish when you
          are available.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-between-groups">
        {state === "unusable" && (
          <Alert variant="destructive">
            <AlertTitle>This invitation can no longer be used</AlertTitle>
            <AlertDescription>
              It has expired, was revoked or was already accepted. Ask the
              person who invited you for a new link.
            </AlertDescription>
          </Alert>
        )}
        {state === "already-registered" && (
          <Alert>
            <AlertTitle>You are already registered as a mentor</AlertTitle>
            <AlertDescription>
              This invitation was not used.{" "}
              <TextLink href="/mentor/profile">Open your profile</TextLink>.
            </AlertDescription>
          </Alert>
        )}
        {state === "wrong-email" && (
          <Alert variant="destructive">
            <AlertTitle>
              This invitation is for another e-mail address
            </AlertTitle>
            <AlertDescription>
              Sign in with the address it was sent to, then open the link again.
            </AlertDescription>
          </Alert>
        )}
        {state === "no-verified-email" && (
          <Alert variant="destructive">
            <AlertTitle>Your GitHub account has no verified e-mail</AlertTitle>
            <AlertDescription>
              This invitation is bound to an e-mail address. Sign in with the
              link we e-mail you for that address.
            </AlertDescription>
          </Alert>
        )}
        {state === "server-error" && (
          <Alert variant="destructive">
            <AlertTitle>The invitation was not accepted</AlertTitle>
            <AlertDescription>
              Something broke on our side. Nothing was changed. Try again in a
              minute.
            </AlertDescription>
          </Alert>
        )}
        <p className="text-interface text-muted-foreground">
          How we handle your data is described in the{" "}
          <TextLink href="/privacy">privacy notice</TextLink>.
        </p>
      </CardContent>
      {(state === "signed-in" ||
        state === "accepting" ||
        state === "server-error") && (
        <CardFooter>
          <Button loading={state === "accepting"} loadingLabel="Accepting…">
            Accept invitation
          </Button>
        </CardFooter>
      )}
      {state === "signed-out" && (
        <CardFooter>
          <Button>Sign in to accept</Button>
        </CardFooter>
      )}
    </Card>
  </ScreenFrame>
);

const meta = {
  title: "Product/E01 Mentor supply/Screens/Join",
  component: JoinScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JoinScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  name: "Signed in, valid invitation",
  args: { state: "signed-in" },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole("button", { name: "Accept invitation" }),
    ).toBeVisible();
  },
};
export const SignedOut: Story = {
  name: "Signed out",
  args: { state: "signed-out" },
};
export const Accepting: Story = {
  name: "Accepting (pending)",
  args: { state: "accepting" },
};
export const AlreadyRegistered: Story = {
  name: "Already registered",
  args: { state: "already-registered" },
};
export const Unusable: Story = {
  name: "Expired, revoked or used",
  args: { state: "unusable" },
};
export const WrongEmail: Story = {
  name: "Bound to another e-mail",
  args: { state: "wrong-email" },
};
export const NoVerifiedEmail: Story = {
  name: "GitHub account without a verified e-mail",
  args: { state: "no-verified-email" },
};
export const ServerError: Story = {
  name: "Server error",
  args: { state: "server-error" },
};
