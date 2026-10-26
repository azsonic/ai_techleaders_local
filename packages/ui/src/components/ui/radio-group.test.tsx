import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field, FieldLabel, FieldLegend, FieldSet } from "./field";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const renderGroup = (disabledItem = false) =>
  render(
    <FieldSet>
      <FieldLegend>Length</FieldLegend>
      <RadioGroup defaultValue="25" className="extra">
        <Field orientation="horizontal">
          <RadioGroupItem value="25" />
          <FieldLabel>25 minutes</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="50" disabled={disabledItem} />
          <FieldLabel>50 minutes</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>,
  );

describe("RadioGroup", () => {
  it("shows the chosen option and changes it on click", () => {
    renderGroup();

    expect(screen.getByRole("radio", { name: "25 minutes" }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("radio", { name: "50 minutes" }));

    expect(screen.getByRole("radio", { name: "50 minutes" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "25 minutes" }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("radiogroup").className).toContain("extra");
  });

  it("does not choose a disabled option", () => {
    renderGroup(true);

    fireEvent.click(screen.getByRole("radio", { name: "50 minutes" }));

    expect(screen.getByRole("radio", { name: "50 minutes" }).getAttribute("aria-checked")).toBe("false");
  });

  it("works outside a Field", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" aria-label="A" className="item" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radio", { name: "A" }).className).toContain("item");
  });
});
