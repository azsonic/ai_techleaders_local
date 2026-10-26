import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ProfileForm,
  emptyProfile,
  validateProfile,
  type ProfileValues,
} from "./profile-form";

const filled: ProfileValues = {
  experience: "Ten years of TypeScript.",
  stacks: ["typescript"],
  price25: "120",
  price50: "220",
  listed: false,
};

describe("validateProfile", () => {
  it("accepts an empty profile and a filled one", () => {
    expect(validateProfile(emptyProfile)).toEqual({});
    expect(validateProfile(filled)).toEqual({});
  });

  it("checks length, whole numbers and the R05 bounds", () => {
    expect(
      validateProfile({ ...filled, experience: "x".repeat(1001) }).experience,
    ).toBe("Use at most 1000 characters.");
    expect(validateProfile({ ...filled, price25: "12.5" }).price25).toBe(
      "Enter a whole number of zloty.",
    );
    expect(validateProfile({ ...filled, price25: "89" }).price25).toBe(
      "Enter a price from 90 to 600 PLN.",
    );
    expect(validateProfile({ ...filled, price25: "601" }).price25).toBe(
      "Enter a price from 90 to 600 PLN.",
    );
    expect(validateProfile({ ...filled, price50: "1201" }).price50).toBe(
      "Enter a price from 180 to 1200 PLN.",
    );
    expect(
      validateProfile({ ...filled, price50: "180" }).price50,
    ).toBeUndefined();
  });
});

describe("ProfileForm", () => {
  it("states the price bounds beside the fields and explains why listing is off", () => {
    render(<ProfileForm canList={false} onSubmit={vi.fn()} />);

    expect(screen.getByText(/90 to 600 PLN, whole zloty/)).toBeTruthy();
    expect(screen.getByText(/180 to 1200 PLN, whole zloty/)).toBeTruthy();
    const listed = screen.getByRole("switch", {
      name: "Listed in the directory",
    });
    expect(listed.hasAttribute("data-disabled")).toBe(true);
    expect(
      screen.getByText(/Save both prices and at least one stack first/),
    ).toBeTruthy();
  });

  it("allows listing once the saved profile can be listed", () => {
    render(<ProfileForm canList onSubmit={vi.fn()} initialValues={filled} />);

    const listed = screen.getByRole("switch", {
      name: "Listed in the directory",
    });
    expect(listed.hasAttribute("data-disabled")).toBe(false);
    expect(
      screen.getByText("Off means only people with your link can find you."),
    ).toBeTruthy();
    fireEvent.click(listed);
    expect(listed.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles stacks on and off", () => {
    render(<ProfileForm canList onSubmit={vi.fn()} initialValues={filled} />);

    const react = screen.getByRole("checkbox", { name: "React" });
    fireEvent.click(react);
    expect(react.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(react);
    expect(react.getAttribute("aria-checked")).toBe("false");
  });

  it("shows a field error on blur and focuses it on a failed submit without sending", () => {
    const onSubmit = vi.fn();
    render(<ProfileForm canList onSubmit={onSubmit} />);
    const price = screen.getByLabelText(/Price for 25 minutes/);

    fireEvent.change(price, { target: { value: "50" } });
    fireEvent.blur(price);
    expect(screen.getByRole("alert").textContent).toBe(
      "Enter a price from 90 to 600 PLN.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(price);
  });

  it("saves, then confirms only after the server answered", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: {} });
    render(<ProfileForm canList onSubmit={onSubmit} initialValues={filled} />);

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
    expect(screen.queryByText("Profile saved")).toBeNull();

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Profile saved"),
    );
    expect(onSubmit).toHaveBeenCalledWith(filled);
  });

  it("shows a server failure and keeps the entries", async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        error: {
          code: "server_error",
          message: "Something broke on our side.",
        },
      });
    render(<ProfileForm canList onSubmit={onSubmit} initialValues={filled} />);

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Something broke on our side.",
      ),
    );
    expect(
      (screen.getByLabelText("Experience (optional)") as HTMLTextAreaElement)
        .value,
    ).toBe(filled.experience);
  });
});
