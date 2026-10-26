import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps a token font size next to a text color", () => {
    expect(cn("text-conversation", "text-foreground")).toBe(
      "text-conversation text-foreground",
    );
  });

  it("resolves token utilities against their own group", () => {
    expect(cn("text-interface", "text-conversation")).toBe("text-conversation");
    expect(cn("font-body", "font-emphasis")).toBe("font-emphasis");
    expect(cn("rounded-control", "rounded-panel")).toBe("rounded-panel");
    expect(cn("p-panel", "p-panel-compact")).toBe("p-panel-compact");
  });
});
