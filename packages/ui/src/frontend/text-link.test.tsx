import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextLink, textLinkClassName } from "./text-link";

describe("TextLink", () => {
  it("renders an underlined link", () => {
    render(<TextLink href="/mentors">Mentors</TextLink>);

    const link = screen.getByRole("link", { name: "Mentors" });
    expect(link.getAttribute("href")).toBe("/mentors");
    expect(link.className).toContain("underline");
    expect(link.hasAttribute("target")).toBe(false);
  });

  it("opens an external link in a new tab and says so", () => {
    render(
      <TextLink href="https://example.com/repo" external className="extra">
        Public repository
      </TextLink>,
    );

    const link = screen.getByRole("link", {
      name: "Public repository (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.className).toContain("extra");
  });

  it("exposes the class for framework links", () => {
    expect(textLinkClassName).toContain("underline");
  });
});
