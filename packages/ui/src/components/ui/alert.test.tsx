import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("is a polite status message by default, with an icon", () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Booking opens soon</AlertTitle>
        <AlertDescription>Prices are visible now.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("status");
    expect(alert.textContent).toContain("Booking opens soon");
    expect(alert.textContent).toContain("Prices are visible now.");
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("announces a destructive alert at once and takes extra classes", () => {
    render(
      <Alert variant="destructive" className="extra">
        <AlertTitle className="title-extra">Payment failed</AlertTitle>
        <AlertDescription className="description-extra">Try another card.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("border-destructive");
    expect(alert.className).toContain("extra");
    expect(screen.getByText("Payment failed").className).toContain("title-extra");
    expect(screen.getByText("Try another card.").className).toContain("description-extra");
  });
});
