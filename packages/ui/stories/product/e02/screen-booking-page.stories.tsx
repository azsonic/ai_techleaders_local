import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { BookingSummary } from "@devmentor/ui/components/bookings/booking-summary";
import { FormFeedback } from "@devmentor/ui/components/form-feedback";
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
  CardHeader,
  CardTitle,
} from "@devmentor/ui/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@devmentor/ui/components/ui/field";
import { Textarea } from "@devmentor/ui/components/ui/textarea";
import { useForm } from "@devmentor/ui/hooks/use-form";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { LONG_QUESTION } from "../../../.storybook/docs/e02-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";

type BookingPageState =
  | "ready"
  | "signed-out"
  | "pending"
  | "slot-taken"
  | "price-changed"
  | "closed"
  | "server-error"
  | "offline"
  | "confirmed"
  | "long-text";

const QUESTION_MAX = 2000;

const MODE: Partial<Record<BookingPageState, ApiMode>> = {
  pending: "pending",
  "server-error": "server-error",
  offline: "offline",
  confirmed: "success",
};

/* Booking page, /book/[slug] (E02-S03). Signed out, the visitor is sent to sign-in and returns to the same selection. */
const BookingPageScreen = ({ state }: { state: BookingPageState }) => {
  const mode = MODE[state] ?? "success";
  const form = useForm<{ question: string }>({
    initialValues: {
      question:
        state === "long-text"
          ? LONG_QUESTION
          : state === "ready" || state === "signed-out"
            ? ""
            : "How do I type a generic reducer?",
    },
    validate: ({ question }) =>
      !question.trim()
        ? { question: "Write your question so the mentor can prepare." }
        : question.length > QUESTION_MAX
          ? { question: `Use at most ${QUESTION_MAX} characters.` }
          : {},
    submit: (values) => mockApiCall(mode, "/api/bookings", values),
  });

  const name =
    state === "long-text"
      ? "Aleksandra Wiśniewska-Kowalczyk-Nowak, senior platform engineer"
      : "Anna Kowalska";
  const price = state === "price-changed" ? 140 : 120;

  return (
    <ScreenFrame width="prose">
      <h1 className="text-heading-page font-emphasis">Book a session</h1>
      <BookingSummary
        mentorName={name}
        minutes={25}
        startsAt="2026-11-13T09:00:00Z"
        pricePln={price}
        zone="Europe/London"
      />

      {state === "signed-out" ? (
        <Card>
          <CardHeader>
            <CardTitle>Sign in to book</CardTitle>
            <CardDescription>
              You will come back to this slot after signing in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Sign in</Button>
          </CardContent>
        </Card>
      ) : state === "closed" ? (
        <Alert variant="destructive">
          <AlertTitle>Booking is not open yet</AlertTitle>
          <AlertDescription>
            Nothing was charged.{" "}
            <a href="/mentors" className={textLinkClassName}>
              See the mentors
            </a>{" "}
            and come back soon.
          </AlertDescription>
        </Alert>
      ) : (
        <form
          onSubmit={form.handleSubmit}
          noValidate
          className="flex flex-col gap-between-groups"
        >
          {state === "slot-taken" && (
            <Alert variant="destructive">
              <AlertTitle>This slot was taken a moment ago</AlertTitle>
              <AlertDescription>
                Nothing was charged.{" "}
                <a href="/mentors/anna-kowalska" className={textLinkClassName}>
                  Choose another slot
                </a>
                .
              </AlertDescription>
            </Alert>
          )}
          {state === "price-changed" && (
            <Alert variant="destructive">
              <AlertTitle>The price changed to 140 PLN</AlertTitle>
              <AlertDescription>
                Nothing was charged. Check the summary above, then book again.
              </AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel>Your question</FieldLabel>
            <FieldDescription>
              Plain text, up to {QUESTION_MAX} characters.{" "}
              {form.values.question.length} used.
            </FieldDescription>
            <Textarea rows={6} {...form.register("question")} />
            <FieldError>{form.errors.question}</FieldError>
          </Field>
          <FormFeedback
            status={form.status}
            serverError={form.serverError}
            successTitle="Booking confirmed"
            successDescription="Both of you were notified. Find it in My bookings."
            failureTitle="The booking was not made"
          />
          <Button
            type="submit"
            loading={form.status === "pending"}
            loadingLabel="Booking…"
            className="w-full sm:w-fit"
          >
            Book session for {price} PLN
          </Button>
        </form>
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E02 Find and book/Screens/Booking page",
  component: BookingPageScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "ready" },
} satisfies Meta<typeof BookingPageScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = { name: "Signed in, summary and question" };
export const SignedOut: Story = {
  name: "Signed out (sign in first)",
  args: { state: "signed-out" },
};
export const SlotTaken: Story = {
  name: "Slot taken at the same moment",
  args: { state: "slot-taken" },
};
export const PriceChanged: Story = {
  name: "Price changed since the page loaded",
  args: { state: "price-changed" },
};
export const Closed: Story = {
  name: "Booking closed (booking_closed)",
  args: { state: "closed" },
};
export const LongText: Story = {
  name: "Long name and question",
  args: { state: "long-text" },
};

const submitted = (
  state: BookingPageState,
  name: string,
  expected: string,
  role: "alert" | "status",
): Story => ({
  name,
  args: { state },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Book session/ }));
    await waitFor(() =>
      expect(canvas.getByRole(role)).toHaveTextContent(expected),
    );
  },
});

export const Pending: Story = {
  name: "Booking (pending): the button is busy and entries stay",
  args: { state: "pending" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Book session/ }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Booking…" })).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
    expect(canvas.getByLabelText("Your question")).toHaveValue(
      "How do I type a generic reducer?",
    );
  },
};
export const ServerError: Story = submitted(
  "server-error",
  "Server error after submit",
  "Something broke on our side",
  "alert",
);
export const Offline: Story = submitted(
  "offline",
  "Offline after submit",
  "The server did not answer",
  "alert",
);
export const Confirmed: Story = submitted(
  "confirmed",
  "Confirmed after the server answered",
  "Booking confirmed",
  "status",
);

export const EmptyQuestion: Story = {
  name: "Interaction: an empty question is refused and focused",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Book session/ }));
    expect(canvas.getByRole("alert")).toHaveTextContent(
      "Write your question so the mentor can prepare.",
    );
    expect(canvas.getByLabelText("Your question")).toHaveFocus();
  },
};
