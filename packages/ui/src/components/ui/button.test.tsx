import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders the default variant and size", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("data-slot")).toBe("button");
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("h-control");
  });

  it("applies a variant, a size, and extra classes", () => {
    render(
      <Button variant="secondary" size="dense" className="extra">
        Secondary
      </Button>,
    );

    const { className } = screen.getByRole("button", { name: "Secondary" });
    expect(className).toContain("extra");
    expect(className).toContain("h-control-dense");
    expect(
      buttonVariants({
        variant: "ghost",
        size: "icon",
        className: "from-variant",
      }),
    ).toContain("from-variant");
  });

  it("removes the fixed height of a text action", () => {
    expect(buttonVariants({ variant: "link" })).toContain("h-auto");
    expect(buttonVariants({ variant: "link", size: "icon" })).not.toContain(
      "h-auto",
    );
  });

  it("calls onClick when idle", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Book" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks activation, stays focusable and announces busy while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Saving…" onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving…" });
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("keeps the label while loading without a loading label", () => {
    render(<Button loading>Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }).getAttribute("aria-busy"),
    ).toBe("true");
  });

  it("is not busy by default", () => {
    render(<Button>Save</Button>);

    expect(
      screen.getByRole("button", { name: "Save" }).hasAttribute("aria-busy"),
    ).toBe(false);
  });
});
