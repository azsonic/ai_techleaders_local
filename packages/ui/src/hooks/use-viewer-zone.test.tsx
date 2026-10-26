import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useViewerZone } from "./use-viewer-zone";

function Probe({ zone }: { zone?: string }) {
  return <output>{useViewerZone(zone)}</output>;
}

describe("useViewerZone", () => {
  it("is UTC on the server, so hydration matches", () => {
    expect(renderToString(<Probe />)).toContain("UTC");
  });

  it("is the browser's zone on the client", () => {
    render(<Probe />);

    expect(screen.getByRole("status").textContent).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it("prefers an explicit zone", () => {
    render(<Probe zone="Europe/Warsaw" />);

    expect(screen.getByRole("status").textContent).toBe("Europe/Warsaw");
  });
});
