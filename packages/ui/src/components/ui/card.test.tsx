import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("renders every region", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Action")).toBeTruthy();
    expect(screen.getByText("Content")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });

  it("accepts the small size and extra classes on each region", () => {
    render(
      <Card size="sm" className="card-extra">
        <CardHeader className="header-extra">
          <CardTitle className="title-extra">Title</CardTitle>
          <CardDescription className="description-extra">Description</CardDescription>
          <CardAction className="action-extra">Action</CardAction>
        </CardHeader>
        <CardContent className="content-extra">Content</CardContent>
        <CardFooter className="footer-extra">Footer</CardFooter>
      </Card>,
    );

    expect(document.querySelector("[data-slot=card]")?.getAttribute("data-size")).toBe("sm");
    expect(document.querySelector("[data-slot=card]")?.className).toContain("card-extra");
    expect(document.querySelector("[data-slot=card-header]")?.className).toContain("header-extra");
    expect(document.querySelector("[data-slot=card-title]")?.className).toContain("title-extra");
    expect(document.querySelector("[data-slot=card-description]")?.className).toContain("description-extra");
    expect(document.querySelector("[data-slot=card-action]")?.className).toContain("action-extra");
    expect(document.querySelector("[data-slot=card-content]")?.className).toContain("content-extra");
    expect(document.querySelector("[data-slot=card-footer]")?.className).toContain("footer-extra");
  });
});
