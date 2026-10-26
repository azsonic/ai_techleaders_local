import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingMessage } from "./loading-message";

describe("LoadingMessage", () => {
  it("uses the default label", () => {
    render(<LoadingMessage />);

    expect(screen.getByRole("status").textContent).toContain("Loading");
  });

  it("renders a custom label and class", () => {
    render(<LoadingMessage label="Checking the database…" className="extra" />);

    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Checking the database");
    expect(status.className).toContain("extra");
  });

  it("has no animation", () => {
    const { container } = render(<LoadingMessage />);

    expect(container.innerHTML).not.toContain("animate");
    expect(container.querySelector("svg")).toBeNull();
  });
});
