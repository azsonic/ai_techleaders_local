import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const renderDialog = (showCloseButton?: boolean) =>
  render(
    <Dialog>
      <DialogTrigger>Edit availability</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton} className="extra">
        <DialogHeader className="header-extra">
          <DialogTitle className="title-extra">Edit availability</DialogTitle>
          <DialogDescription className="description-extra">
            Times are shown in your time zone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="body-extra">Monday 10:00 to 12:00</DialogBody>
        <DialogFooter className="footer-extra">
          <DialogClose>Cancel</DialogClose>
          <button type="button">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );

describe("Dialog", () => {
  it("opens from its trigger as a named dialog with a title and a description", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Edit availability" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Edit availability",
    });
    expect(dialog.getAttribute("data-slot")).toBe("dialog-content");
    expect(dialog.className).toContain("extra");
    expect(dialog.textContent).toContain("Times are shown in your time zone.");
    expect(
      screen.getByText("Edit availability", { selector: "h2" }).className,
    ).toContain("title-extra");
    expect(
      screen.getByText("Times are shown in your time zone.").className,
    ).toContain("description-extra");
    expect(screen.getByText("Monday 10:00 to 12:00").className).toContain(
      "body-extra",
    );
    expect(
      screen.getByText("Cancel").closest("[data-slot=dialog-footer]")
        ?.className,
    ).toContain("footer-extra");
    expect(
      dialog.querySelector("[data-slot=dialog-header]")?.className,
    ).toContain("header-extra");
  });

  it("closes from the close button, which has an accessible name", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Edit availability" }));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can omit the close button", async () => {
    renderDialog(false);
    fireEvent.click(screen.getByRole("button", { name: "Edit availability" }));
    await screen.findByRole("dialog");

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("closes from a footer action", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Edit availability" }));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
