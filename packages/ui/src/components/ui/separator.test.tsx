import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("is horizontal by default and as thin as the divider token", () => {
    render(<Separator data-testid="line" />);

    const line = screen.getByTestId("line");
    expect(line.getAttribute("data-slot")).toBe("separator");
    expect(line.className).toContain("h-(--border-width-divider)");
  });

  it("can be vertical and take extra classes", () => {
    render(
      <Separator orientation="vertical" className="extra" data-testid="line" />,
    );

    expect(screen.getByTestId("line").className).toContain("extra");
    expect(screen.getByTestId("line").getAttribute("data-orientation")).toBe(
      "vertical",
    );
  });
});
