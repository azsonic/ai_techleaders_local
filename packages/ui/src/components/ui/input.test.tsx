import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input, inputVariants } from "./input";
import { Textarea } from "./textarea";

describe("Input", () => {
  it("renders the default density", () => {
    render(<Input aria-label="Name" type="text" />);

    const input = screen.getByLabelText("Name");
    expect(input.getAttribute("data-slot")).toBe("input");
    expect(input.className).toContain("h-control");
  });

  it("renders the dense density and extra classes", () => {
    render(<Input aria-label="Filter" density="dense" className="extra" />);

    expect(screen.getByLabelText("Filter").className).toContain(
      "h-control-dense",
    );
    expect(screen.getByLabelText("Filter").className).toContain("extra");
    expect(inputVariants()).toContain("h-control");
  });
});

describe("Textarea", () => {
  it("renders with the conversation size", () => {
    render(<Textarea aria-label="Question" className="extra" />);

    const textarea = screen.getByLabelText("Question");
    expect(textarea.getAttribute("data-slot")).toBe("textarea");
    expect(textarea.className).toContain("text-conversation");
    expect(textarea.className).toContain("extra");
  });
});
