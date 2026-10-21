import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import Home from "./page";

describe("Home", () => {
  it("introduces DevMentor and links to the admin area", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Grow as a developer, one session at a time." })).toBeTruthy();
    expect(screen.getByText("Mentoring, learning paths and feedback for engineers and tech leaders.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to admin" }).getAttribute("href")).toBe("/admin");
  });
});
