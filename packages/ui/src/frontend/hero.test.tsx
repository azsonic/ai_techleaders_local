import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Hero } from "./hero";

describe("Hero", () => {
  it("renders only the title when that is all it is given", () => {
    render(<Hero title="Only title" />);

    expect(screen.getByRole("heading", { name: "Only title" })).toBeTruthy();
    expect(screen.queryByText("DevMentor")).toBeNull();
  });

  it("renders the eyebrow, description, and actions", () => {
    render(
      <Hero eyebrow="DevMentor" title="Grow" description="A short description" className="extra">
        <a href="/admin">Go to admin</a>
      </Hero>,
    );

    expect(screen.getByText("DevMentor")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Grow" })).toBeTruthy();
    expect(screen.getByText("A short description")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to admin" })).toBeTruthy();
    expect(document.querySelector("section")?.className).toContain("extra");
  });
});
