import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders the default variant and size", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button", { name: "Save" }).getAttribute("data-slot")).toBe("button");
  });

  it("applies a variant, a size, and extra classes", () => {
    render(
      <Button variant="outline" size="lg" className="extra">
        Outline
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Outline" }).className).toContain("extra");
    expect(buttonVariants({ variant: "ghost", size: "icon", className: "from-variant" })).toContain("from-variant");
  });
});
