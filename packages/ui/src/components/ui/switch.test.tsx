import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, FieldDescription, FieldLabel } from "./field";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles and reports its state", () => {
    render(<Switch aria-label="Listed in the directory" />);

    const toggle = screen.getByRole("switch", { name: "Listed in the directory" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(toggle.getAttribute("data-slot")).toBe("switch");
  });

  it("does not toggle when disabled", () => {
    render(<Switch aria-label="Listed" disabled />);

    const toggle = screen.getByRole("switch", { name: "Listed" });
    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-checked")).toBe("false");
  });

  it("is named by its label and described by the reason inside a Field", () => {
    render(
      <Field orientation="horizontal">
        <Switch disabled />
        <FieldLabel>Listed in the directory</FieldLabel>
        <FieldDescription>Save both prices and one stack first.</FieldDescription>
      </Field>,
    );

    const toggle = screen.getByRole("switch", { name: "Listed in the directory" });
    expect(toggle.getAttribute("aria-describedby")).toBe(screen.getByText("Save both prices and one stack first.").id);
  });
});
