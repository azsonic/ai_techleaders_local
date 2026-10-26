import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";

describe("Field", () => {
  it("connects label, hint and control", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldDescription>We only use it to sign you in.</FieldDescription>
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    const hint = screen.getByText("We only use it to sign you in.");
    expect(input.getAttribute("aria-describedby")).toBe(hint.id);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("announces an error and marks the control invalid", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Textarea />
        <FieldDescription>Hint</FieldDescription>
        <FieldError>
          Enter an email address, for example name@company.com.
        </FieldError>
      </Field>,
    );

    const control = screen.getByLabelText("Email");
    const error = screen.getByRole("alert");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(control.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("has no hint or error reference when none is shown", () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError />
      </Field>,
    );

    expect(screen.getByLabelText("Name").hasAttribute("aria-describedby")).toBe(
      false,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("drops the error reference when the error goes away", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError>Required</FieldError>
      </Field>,
    );
    expect(screen.getByLabelText("Name").getAttribute("aria-invalid")).toBe(
      "true",
    );

    rerender(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError />
      </Field>,
    );

    expect(screen.getByLabelText("Name").hasAttribute("aria-invalid")).toBe(
      false,
    );
  });

  it("builds the message from a list of errors, once each", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Price</FieldLabel>
        <Input />
        <FieldError
          errors={[{ message: "Too low" }, { message: "Too low" }, undefined]}
        />
      </Field>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Too low");

    rerender(
      <Field>
        <FieldLabel>Price</FieldLabel>
        <Input />
        <FieldError
          errors={[{ message: "Too low" }, { message: "Not a number" }]}
        />
      </Field>,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      ["Too low", "Not a number"],
    );
  });

  it("marks an optional field in text", () => {
    render(
      <Field>
        <FieldLabel optional>Note</FieldLabel>
        <Input />
      </Field>,
    );

    expect(screen.getByLabelText("Note (optional)")).toBeTruthy();
  });

  it("renders groups and the horizontal orientation", () => {
    render(
      <FieldSet>
        <FieldLegend>Stacks</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>Content</FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>,
    );

    expect(screen.getByRole("group", { name: "Stacks" })).toBeTruthy();
    expect(
      screen
        .getByText("Content")
        .closest("[data-slot=field]")
        ?.getAttribute("data-orientation"),
    ).toBe("horizontal");
  });

  it("lets controls work outside a Field", () => {
    render(
      <>
        <Label htmlFor="solo">Solo</Label>
        <Input id="solo" />
        <FieldLabel>Detached label</FieldLabel>
        <FieldDescription>Detached hint</FieldDescription>
        <FieldError>Detached error</FieldError>
      </>,
    );

    expect(screen.getByLabelText("Solo").hasAttribute("aria-describedby")).toBe(
      false,
    );
    expect(screen.getByRole("alert").hasAttribute("id")).toBe(false);
  });
});
