import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RefundOutcomeLine, type MoneyOutcome } from "./refund-outcome-line";

const text = (outcome: MoneyOutcome, settled = false) => {
  const { container, unmount } = render(
    <RefundOutcomeLine outcome={outcome} pricePln={120} settled={settled} />,
  );
  const line = container.textContent;
  unmount();
  return line;
};

describe("RefundOutcomeLine", () => {
  it("puts the amount first, in the strong weight", () => {
    render(<RefundOutcomeLine outcome="full" pricePln={120} />);

    expect(screen.getByText("Full refund due: 120 PLN.").tagName).toBe(
      "STRONG",
    );
  });

  it("words every refund outcome with its rule", () => {
    expect(text("grace")).toBe(
      "Full refund due: 120 PLN. You cancelled within 15 minutes of booking.",
    );
    expect(text("full")).toContain("at least two hours before the start");
    expect(text("nobody-present")).toContain("The operator has been told.");
  });

  it("promises the same day only where R04 does", () => {
    expect(text("mentor-cancelled")).toContain("120 PLN, the same day.");
    expect(text("mentor-absent")).toContain("120 PLN, the same day.");
    expect(text("full")).not.toContain("same day");
  });

  it("says plainly when there is no refund", () => {
    expect(text("late")).toBe(
      "No refund. You cancelled less than two hours before the start. The mentor is paid.",
    );
    expect(text("mentee-absent")).toContain("No refund.");
  });

  it("switches to the past tense once the refund was made", () => {
    expect(text("mentor-cancelled", true)).toContain(
      "Refunded in full: 120 PLN.",
    );
    expect(text("late", true)).toContain("No refund.");
  });
});
