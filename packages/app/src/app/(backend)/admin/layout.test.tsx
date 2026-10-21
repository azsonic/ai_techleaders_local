import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminLayout from "./layout";

describe("AdminLayout", () => {
  it("frames the admin page", () => {
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>Dashboard</p>
      </AdminLayout>,
    );

    expect(screen.getByText("DevMentor Admin")).toBeTruthy();
    expect(screen.getByText("Dashboard")).toBeTruthy();
  });
});
