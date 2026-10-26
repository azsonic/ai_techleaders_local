import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormFeedback } from "./form-feedback";

const base = { successTitle: "Profile saved" };

describe("FormFeedback", () => {
  it("shows nothing while idle, pending or after a field-only error", () => {
    const { container } = render(
      <FormFeedback status="pending" serverError={null} {...base} />,
    );
    expect(container.textContent).toBe("");
  });

  it("confirms success with an optional description", () => {
    render(
      <FormFeedback
        status="success"
        serverError={null}
        successDescription="Mentees see it now."
        {...base}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("Profile saved");
    expect(screen.getByRole("status").textContent).toContain(
      "Mentees see it now.",
    );
  });

  it("confirms success with a title only", () => {
    render(<FormFeedback status="success" serverError={null} {...base} />);

    expect(screen.getByRole("status").textContent).toBe("Profile saved");
  });

  it("explains a server failure with the server's message and the default title", () => {
    render(
      <FormFeedback
        status="error"
        serverError={{
          code: "conflict",
          message: "This window overlaps another one.",
        }}
        {...base}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain("Could not save");
    expect(screen.getByRole("alert").textContent).toContain(
      "This window overlaps another one.",
    );
  });

  it("uses a custom failure title", () => {
    render(
      <FormFeedback
        status="error"
        serverError={{ code: "conflict", message: "Overlap." }}
        failureTitle="Could not add the window"
        {...base}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Could not add the window",
    );
  });

  it("uses its own wording when the server cannot be reached and says the entries are kept", () => {
    render(
      <FormFeedback
        status="error"
        serverError={{
          code: "network_error",
          message: "Could not reach the server",
        }}
        {...base}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "The server did not answer",
    );
    expect(screen.getByRole("alert").textContent).toContain(
      "What you entered is kept.",
    );
  });
});
