import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  it("uses the default title", () => {
    render(<ErrorMessage />);

    expect(screen.getByRole("alert").textContent).toContain("Something went wrong");
  });

  it("renders a custom title, message, and class", () => {
    render(<ErrorMessage title="Health check failed" message="Database is unavailable" className="extra" />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Health check failed");
    expect(alert.textContent).toContain("Database is unavailable");
    expect(alert.className).toContain("extra");
  });

  it("renders the next step", () => {
    render(<ErrorMessage title="Could not load bookings" action={<button>Try again</button>} />);

    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });
});
