import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const renderDialog = (onConfirm = vi.fn()) =>
  render(
    <AlertDialog>
      <AlertDialogTrigger>Cancel booking</AlertDialogTrigger>
      <AlertDialogContent className="extra">
        <AlertDialogHeader className="header-extra">
          <AlertDialogTitle className="title-extra">
            Cancel Friday session?
          </AlertDialogTitle>
          <AlertDialogDescription className="description-extra">
            Full refund due when payments process.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="footer-extra">
          <AlertDialogCancel className="cancel-extra">
            Keep booking
          </AlertDialogCancel>
          <AlertDialogAction
            className="action-extra"
            variant="destructive"
            onClick={onConfirm}
          >
            Cancel booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );

describe("AlertDialog", () => {
  it("opens as an alertdialog named by its title and described by its text", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));

    const dialog = await screen.findByRole("alertdialog", {
      name: "Cancel Friday session?",
    });
    expect(dialog.getAttribute("data-slot")).toBe("alert-dialog-content");
    expect(dialog.className).toContain("extra");
    expect(dialog.textContent).toContain(
      "Full refund due when payments process.",
    );
    expect(screen.getByText("Cancel Friday session?").className).toContain(
      "title-extra",
    );
    expect(
      screen.getByText("Full refund due when payments process.").className,
    ).toContain("description-extra");
    expect(
      dialog.querySelector("[data-slot=alert-dialog-header]")?.className,
    ).toContain("header-extra");
    expect(
      dialog.querySelector("[data-slot=alert-dialog-footer]")?.className,
    ).toContain("footer-extra");
  });

  it("closes from Cancel and keeps the action a plain button", async () => {
    const onConfirm = vi.fn();
    renderDialog(onConfirm);
    fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    await screen.findByRole("alertdialog");

    const cancel = screen.getByRole("button", { name: "Keep booking" });
    expect(cancel.className).toContain("cancel-extra");
    fireEvent.click(cancel);

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("runs the action without closing the dialog by itself", async () => {
    const onConfirm = vi.fn();
    renderDialog(onConfirm);
    fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
    await screen.findByRole("alertdialog");

    const action = screen
      .getAllByRole("button", { name: "Cancel booking" })
      .find(
        (button) => button.getAttribute("data-slot") === "alert-dialog-action",
      );
    expect(action?.className).toContain("action-extra");
    fireEvent.click(action as HTMLElement);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
});
