import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getInitials } from "../../lib/initials";
import { Avatar, avatarVariants } from "./avatar";

describe("Avatar", () => {
  it("shows initials and is described by the name", () => {
    render(<Avatar name="Anna Kowalska" />);

    const avatar = screen.getByRole("img", { name: "Anna Kowalska" });
    expect(avatar.textContent).toBe("AK");
    expect(avatar.className).toContain("size-control-dense");
  });

  it("takes a size and extra classes", () => {
    render(<Avatar name="Jan Nowak" size="lg" className="extra" />);

    expect(screen.getByRole("img", { name: "Jan Nowak" }).className).toContain("size-control");
    expect(screen.getByRole("img", { name: "Jan Nowak" }).className).toContain("extra");
    expect(avatarVariants({ size: "xs" })).toContain("size-control-min");
  });

  it("is hidden from screen readers when decorative", () => {
    const { container } = render(<Avatar name="Anna Kowalska" decorative />);

    const root = container.querySelector("[data-slot=avatar]")!;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.hasAttribute("role")).toBe(false);
  });

  it("keeps the initials until an image has loaded", () => {
    const { container } = render(<Avatar name="Anna Kowalska" src="https://example.com/anna.png" />);

    expect(container.querySelector("[data-slot=avatar-fallback]")?.textContent).toBe("AK");
  });
});

describe("getInitials", () => {
  it.each([
    ["Anna Kowalska", "AK"],
    ["anna maria kowalska", "AK"],
    ["Madonna", "MA"],
    ["  Jan   Nowak ", "JN"],
    ["", "?"],
    ["   ", "?"],
  ])("turns %j into %j", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
