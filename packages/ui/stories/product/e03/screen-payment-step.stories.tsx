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
import { useForm } from "@devmentor/ui/hooks/use-form";
import { textLinkClassName } from "@devmentor/ui/frontend/text-link";

import { LONG_QUESTION } from "../../../.storybook/docs/e02-data";
import { LONG_MENTEE_NAME } from "../../../.storybook/docs/e03-data";
import { mockApiCall, type ApiMode } from "../../../.storybook/docs/mock-api";
import { ScreenFrame } from "../../../.storybook/docs/screen";
import { StripeFields } from "../../../.storybook/docs/stripe-placeholder";

type PaymentState =
  | "ready"
  | "pending"
  | "declined"
  | "slot-taken"
  | "server-error"
  | "offline"
  | "paid"
  | "long-text";

const MODE: Partial<Record<PaymentState, ApiMode>> = {
  pending: "pending",
  declined: "declined",
  "server-error": "server-error",
  offline: "offline",
  paid: "success",
};

const PRICE = 120;
const QUESTION = "How do I type a generic reducer?";

/*
 * Payment step (E03-S01), the last step of the booking page. Proposal: no spec exists for E03. The charge is taken only
 * for a confirmed booking (R06, R04), in Stripe test mode until a legal owner is named (D18, R07). A declined card
 * is an error that needs an action, so it is an alert with the way forward, never a toast.
 */
const PaymentStepScreen = ({ state }: { state: PaymentState }) => {
  const mode = MODE[state] ?? "success";
  const form = useForm<Record<string, never>>({
    initialValues: {},
    validate: () => ({}),
    submit: () => mockApiCall(mode, "/api/bookings/b1/payment", {}),
  });
  const longText = state === "long-text";

  return (
    <ScreenFrame width="prose">
      <h1 className="text-heading-page font-emphasis">Pay and book</h1>
      <BookingSummary
        mentorName={longText ? LONG_MENTEE_NAME : "Anna Kowalska"}
        minutes={25}
        startsAt="2026-11-13T09:00:00Z"
        pricePln={PRICE}
        zone="Europe/London"
      />
      <section aria-label="Your question" className="flex flex-col gap-inline">
        <h2 className="text-interface font-emphasis">Your question</h2>
        <p className="text-conversation whitespace-pre-wrap wrap-anywhere">
          {longText ? LONG_QUESTION : QUESTION}
        </p>
      </section>

      {form.status === "success" ? (
        <FormFeedback
          status="success"
          serverError={null}
          successTitle="Booking confirmed and paid"
          successDescription={`${PRICE} PLN was charged in test mode. Both of you were notified. Find it in My bookings.`}
        />
      ) : (
        <form
          onSubmit={form.handleSubmit}
          noValidate
          className="flex flex-col gap-between-groups"
        >
          <Alert>
            <AlertTitle>Test mode</AlertTitle>
            <AlertDescription>
              No real money is charged until live payments are switched on.
            </AlertDescription>
          </Alert>
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
          <StripeFields />
          <FormFeedback
            status={form.status}
            serverError={form.serverError}
            successTitle="Booking confirmed and paid"
            failureTitle="The payment did not go through"
          />
          <Button
            type="submit"
            loading={form.status === "pending"}
            loadingLabel="Paying…"
            className="w-full sm:w-fit"
          >
            Pay {PRICE} PLN and book
          </Button>
        </form>
      )}
    </ScreenFrame>
  );
};

const meta = {
  title: "Product/E03 Payments/Screens/Payment step",
  component: PaymentStepScreen,
  parameters: { layout: "fullscreen" },
  args: { state: "ready" },
} satisfies Meta<typeof PaymentStepScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  name: "Ready: summary, question, payment details",
};
export const SlotTaken: Story = {
  name: "Slot taken, nothing charged",
  args: { state: "slot-taken" },
};
export const LongText: Story = {
  name: "Long name and question",
  args: { state: "long-text" },
};

const paid = (
  state: PaymentState,
  name: string,
  expected: string,
  role: "alert" | "status",
): Story => ({
  name,
  args: { state },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Pay 120 PLN/ }));
    await waitFor(() =>
      expect(canvas.getByRole(role)).toHaveTextContent(expected),
    );
  },
});

export const Pending: Story = {
  name: "Paying (pending): the button is busy",
  args: { state: "pending" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Pay 120 PLN/ }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Paying…" })).toHaveAttribute(
        "aria-busy",
        "true",
      ),
    );
  },
};
export const Declined = paid(
  "declined",
  "Card declined: an alert with the next step",
  "Your card was declined. Nothing was charged.",
  "alert",
);
export const ServerError = paid(
  "server-error",
  "Server error after submit",
  "Something broke on our side",
  "alert",
);
export const Offline = paid(
  "offline",
  "Offline after submit",
  "The server did not answer",
  "alert",
);
export const Paid = paid(
  "paid",
  "Paid, after the server confirmed",
  "Booking confirmed and paid",
  "status",
);
