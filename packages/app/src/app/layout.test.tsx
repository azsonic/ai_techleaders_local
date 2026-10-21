import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-sans" }),
  Geist_Mono: () => ({ variable: "font-mono" }),
}));

vi.mock("./globals.css", () => ({}));

import RootLayout, { metadata } from "./layout";

describe("RootLayout", () => {
  it("describes the site and renders the fonts around the page", () => {
    expect(metadata.title).toBe("DevMentor");
    expect(metadata.description).toBe("Mentoring, learning paths and feedback for engineers and tech leaders.");

    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <p>Page</p>
      </RootLayout>,
    );

    expect(html).toContain("font-sans");
    expect(html).toContain("font-mono");
    expect(html).toContain("Page");
    expect(html).toContain('lang="en"');
  });
});
