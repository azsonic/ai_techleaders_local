import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LengthChoice, PriceOption } from "./length-choice";

describe("PriceOption", () => {
  it("shows the length and the price", () => {
    render(<PriceOption minutes={25} price={120} />);

    expect(screen.getByText("25 minutes")).toBeTruthy();
    expect(screen.getByText("120 PLN")).toBeTruthy();
  });
});

describe("LengthChoice", () => {
  it("shows both prices before a length is chosen", () => {
    render(<LengthChoice prices={{ 25: 120, 50: 220 }} />);

    expect(
      screen.getByRole("radio", { name: /25 minutes\s*120 PLN/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: /50 minutes\s*220 PLN/ }),
    ).toBeTruthy();
    expect(
      screen
        .getAllByRole("radio")
        .every((radio) => radio.getAttribute("aria-checked") === "false"),
    ).toBe(true);
  });

  it("reports the chosen length", () => {
    const onValueChange = vi.fn();
    render(
      <LengthChoice
        prices={{ 25: 120, 50: 220 }}
        value="25"
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen
        .getByRole("radio", { name: /25 minutes/ })
        .getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: /50 minutes/ }));

    expect(onValueChange).toHaveBeenCalledWith("50");
  });

  it("works without a change handler", () => {
    render(<LengthChoice prices={{ 25: 120, 50: 220 }} />);

    fireEvent.click(screen.getByRole("radio", { name: /50 minutes/ }));

    expect(screen.getByRole("radiogroup")).toBeTruthy();
  });
});
