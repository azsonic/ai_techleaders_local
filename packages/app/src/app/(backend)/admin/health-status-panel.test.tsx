import type { ApiResult } from "@devmentor/core";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HealthStatus } from "@/modules/health/health.service";

const apiCall = vi.hoisted(() => vi.fn());

vi.mock("@devmentor/ui/backend/api/api-call", () => ({ apiCall }));

import { HealthStatusPanel } from "./health-status-panel";

const healthy: ApiResult<HealthStatus> = { ok: true, data: { status: "ok", db: "ok" } };

describe("HealthStatusPanel", () => {
  it("shows a loading message until the health check returns", async () => {
    let resolveCall: (value: ApiResult<HealthStatus>) => void = () => {};
    apiCall.mockReturnValue(
      new Promise((resolve) => {
        resolveCall = resolve;
      }),
    );

    render(<HealthStatusPanel />);

    expect(screen.getByRole("status").textContent).toContain("Checking the database");

    await act(async () => {
      resolveCall(healthy);
    });

    expect(screen.getByText("Database connection is healthy.")).toBeTruthy();
  });

  it("shows the error returned by the health check", async () => {
    apiCall.mockResolvedValue({
      ok: false,
      error: { code: "database_unavailable", message: "Database is unavailable" },
    });

    render(<HealthStatusPanel />);

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("Database is unavailable"));
  });

  it("ignores a response that arrives after the panel unmounts", async () => {
    let resolveCall: (value: ApiResult<HealthStatus>) => void = () => {};
    apiCall.mockReturnValue(
      new Promise((resolve) => {
        resolveCall = resolve;
      }),
    );
    const { unmount } = render(<HealthStatusPanel />);
    unmount();

    await act(async () => {
      resolveCall(healthy);
    });

    expect(screen.queryByText("Database connection is healthy.")).toBeNull();
  });
});
