/**
 * Documentation helper: the place where Stripe's own payment form renders. It is hosted by Stripe, so it is not part of
 * this system and no field is drawn here; the box only marks the spot so the screen's layout and spacing are visible.
 */
export const StripeFields = () => (
  <div
    role="group"
    aria-label="Payment details"
    className="rounded-panel border border-border bg-muted p-panel text-interface text-muted-foreground"
  >
    Payment details. Stripe renders this form; its fields and errors are not
    designed here.
  </div>
);
