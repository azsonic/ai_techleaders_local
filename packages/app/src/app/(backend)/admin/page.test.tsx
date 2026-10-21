import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@devmentor/ui/backend/api/api-call", () => ({
  apiCall: vi.fn(() => new Promise(() => {})),
}));

import AdminDashboard from "./page";

describe("AdminDashboard", () => {
  it("shows the dashboard and starts the database check", () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("The DevMentor back office is ready for its first feature.")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Checking the database");
    expect(screen.getByRole("link", { name: "View site" }).getAttribute("href")).toBe("/");
  });
});
