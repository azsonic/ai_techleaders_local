import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders a title on its own", () => {
    render(<EmptyState title="No mentors yet" />);

    expect(screen.getByText("No mentors yet")).toBeTruthy();
  });

  it("renders a description, an action, and extra classes", () => {
    render(
      <EmptyState title="No mentors yet" description="Invite one" action={<button>Invite</button>} className="extra" />,
    );

    expect(screen.getByText("Invite one")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Invite" })).toBeTruthy();
    expect(screen.getByText("No mentors yet").closest("div")?.className).toContain("extra");
  });
});
