import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StackBadge } from "./stack-badge";

describe("StackBadge", () => {
  it("writes the stack's name out", () => {
    render(<StackBadge stack="ai-agents" />);

    expect(screen.getByText("AI agents").getAttribute("data-slot")).toBe(
      "stack-badge",
    );
  });
});
