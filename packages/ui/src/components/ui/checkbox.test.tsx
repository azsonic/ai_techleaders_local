import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

describe("Checkbox", () => {
  it("toggles by click and shows the check", () => {
    render(<Checkbox aria-label="TypeScript" />);

    const box = screen.getByRole("checkbox", { name: "TypeScript" });
    expect(box.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(box);

    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(box.getAttribute("data-slot")).toBe("checkbox");
  });

  it("supports the mixed state", () => {
    render(<Checkbox aria-label="All stacks" indeterminate />);

    expect(screen.getByRole("checkbox", { name: "All stacks" }).getAttribute("aria-checked")).toBe("mixed");
  });

  it("does not toggle when disabled", () => {
    render(<Checkbox aria-label="Python" disabled />);

    const box = screen.getByRole("checkbox", { name: "Python" });
    fireEvent.click(box);

    expect(box.getAttribute("aria-checked")).toBe("false");
  });

  it("is named by its label and announces hint and error inside a Field", () => {
    render(
      <Field orientation="horizontal">
        <Checkbox />
        <FieldLabel>I have read the privacy notice</FieldLabel>
        <FieldDescription>Required to sign in.</FieldDescription>
        <FieldError>Accept the notice to continue.</FieldError>
      </Field>,
    );

    const box = screen.getByRole("checkbox", { name: "I have read the privacy notice" });
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("aria-describedby")).toContain(screen.getByRole("alert").id);
  });
});
