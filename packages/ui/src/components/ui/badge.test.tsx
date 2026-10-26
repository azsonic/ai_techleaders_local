import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders the status text with the default variant", () => {
    render(<Badge>Confirmed</Badge>);

    const badge = screen.getByText("Confirmed");
    expect(badge.getAttribute("data-slot")).toBe("badge");
    expect(badge.className).toContain("bg-primary");
  });

  it("renders the other variants and extra classes", () => {
    render(
      <>
        <Badge variant="secondary">Pending</Badge>
        <Badge variant="destructive" className="extra">
          Cancelled
        </Badge>
      </>,
    );

    expect(screen.getByText("Pending").className).toContain("bg-secondary");
    expect(screen.getByText("Cancelled").className).toContain(
      "text-destructive",
    );
    expect(screen.getByText("Cancelled").className).toContain("extra");
    expect(badgeVariants()).toContain("min-h-control-min");
    expect(badgeVariants()).toContain("max-w-full");
  });
});
