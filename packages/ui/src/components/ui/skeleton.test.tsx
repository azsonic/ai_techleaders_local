import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is a static, hidden placeholder", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);

    const block = container.querySelector("[data-slot=skeleton]")!;
    expect(block.getAttribute("aria-hidden")).toBe("true");
    expect(block.className).toContain("w-24");
    expect(block.className).not.toContain("animate");
  });
});
