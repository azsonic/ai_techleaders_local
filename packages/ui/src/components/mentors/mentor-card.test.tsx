import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MentorCard, MentorCardSkeleton } from "./mentor-card";

describe("MentorCard", () => {
  it("shows a listing with name link, stacks, price and nearest slot", () => {
    render(
      <MentorCard
        displayName="Anna Kowalska"
        stacks={["typescript", "react"]}
        priceFrom={90}
        nearestSlot="Fri 14 Nov, 18:00"
        href="/mentors/anna"
        className="extra"
      />,
    );

    const link = screen.getByRole("link", { name: "Anna Kowalska" });
    expect(link.getAttribute("href")).toBe("/mentors/anna");
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Anna Kowalska",
    );
    expect(screen.getByRole("list", { name: "Stacks" }).textContent).toBe(
      "TypeScriptReact",
    );
    expect(screen.getByText("from 90 PLN")).toBeTruthy();
    expect(screen.getByText("Fri 14 Nov, 18:00")).toBeTruthy();
    expect(
      document.querySelector("[data-slot=mentor-card]")?.className,
    ).toContain("extra");
  });

  it("says plainly when prices or a slot are missing", () => {
    render(
      <MentorCard
        displayName="Piotr"
        stacks={["python"]}
        priceFrom={null}
        nearestSlot={null}
      />,
    );

    expect(screen.getByText("Prices not set yet")).toBeTruthy();
    expect(screen.getByText("No bookable slot yet")).toBeTruthy();
  });

  it("treats omitted price and slot like missing ones, and a name without a link as plain text", () => {
    render(<MentorCard displayName="Piotr" stacks={[]} headingLevel={3} />);

    expect(screen.getByText("Prices not set yet")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Piotr");
  });

  it("shows the public profile card with the text-only line and no price", () => {
    render(
      <MentorCard
        variant="profile"
        displayName="Anna Kowalska"
        stacks={["react"]}
        headingLevel={1}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Anna Kowalska",
    );
    expect(screen.getByText("Sessions are text only.")).toBeTruthy();
    expect(screen.queryByText("Price")).toBeNull();
  });
});

describe("MentorCardSkeleton", () => {
  it("is hidden from assistive technology", () => {
    render(<MentorCardSkeleton />);

    expect(
      document
        .querySelector("[data-slot=mentor-card-skeleton]")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });
});
