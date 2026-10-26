import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ApiResult } from "@devmentor/core";

import { useForm } from "./use-form";

type Values = { name: string; email: string; agree: string };
const initialValues: Values = { name: "", email: "", agree: "" };

const validate = (values: Values) => ({
  ...(values.name ? {} : { name: "Enter a name." }),
  ...(values.email.includes("@") ? {} : { email: "Enter an e-mail address." }),
  ...(values.agree ? {} : { agree: "Agree to continue." }),
});

function Harness({
  submit,
  onSuccess,
  clearOnSuccess = false,
}: {
  submit: (values: Values) => Promise<ApiResult<string>>;
  onSuccess?: (data: string) => void;
  clearOnSuccess?: boolean;
}) {
  const form = useForm<Values, string>({
    initialValues,
    validate,
    submit,
    onSuccess: (data) => {
      onSuccess?.(data);
      if (clearOnSuccess) form.reset({ keepStatus: true });
    },
  });
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <input aria-label="Name" {...form.register("name")} />
      <output data-testid="name-error">{form.errors.name}</output>
      <input aria-label="E-mail" {...form.register("email")} />
      <output data-testid="email-error">{form.errors.email}</output>
      <input
        aria-label="Agree"
        name="agree"
        value={form.values.agree}
        onChange={(event) => form.setValue("agree", event.target.value)}
      />
      <output data-testid="agree-error">{form.errors.agree}</output>
      <output data-testid="status">{form.status}</output>
      <output data-testid="server">{form.serverError?.code}</output>
      <button type="submit">Send</button>
      <button type="button" onClick={() => form.handleSubmit()}>
        Send without event
      </button>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
    </form>
  );
}

const fill = () => {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Anna" },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "anna@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Agree"), {
    target: { value: "yes" },
  });
};

const text = (id: string) => screen.getByTestId(id).textContent;

describe("useForm", () => {
  it("shows an error only after the field is left, and removes it when the value is valid", () => {
    render(<Harness submit={vi.fn()} />);

    expect(text("name-error")).toBe("");
    fireEvent.blur(screen.getByLabelText("Name"));
    expect(text("name-error")).toBe("Enter a name.");

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Anna" },
    });
    expect(text("name-error")).toBe("");
  });

  it("blocks an invalid submit, shows every error and focuses the first invalid field", () => {
    const submit = vi.fn();
    render(<Harness submit={submit} />);

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(submit).not.toHaveBeenCalled();
    expect(text("name-error")).toBe("Enter a name.");
    expect(text("email-error")).toBe("Enter an e-mail address.");
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    expect(text("status")).toBe("idle");
  });

  it("does not fail when the first invalid field has no ref", () => {
    render(<Harness submit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Anna" },
    });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "anna@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(text("agree-error")).toBe("Agree to continue.");
  });

  it("reports success only after the server confirmed, and returns to idle on the next edit", async () => {
    let resolve: (value: ApiResult<string>) => void = () => {};
    const submit = vi.fn(
      () => new Promise<ApiResult<string>>((done) => (resolve = done)),
    );
    const onSuccess = vi.fn();
    render(<Harness submit={submit} onSuccess={onSuccess} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(text("status")).toBe("pending");
    expect(onSuccess).not.toHaveBeenCalled();

    await act(async () => resolve({ ok: true, data: "saved" }));

    expect(text("status")).toBe("success");
    expect(onSuccess).toHaveBeenCalledWith("saved");

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Anna K." },
    });
    expect(text("status")).toBe("idle");
  });

  it("succeeds without an onSuccess callback", async () => {
    render(<Harness submit={async () => ({ ok: true, data: "saved" })} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send without event" }));

    await waitFor(() => expect(text("status")).toBe("success"));
  });

  it("ignores a second submit while one is pending", async () => {
    let resolve: (value: ApiResult<string>) => void = () => {};
    const submit = vi.fn(
      () => new Promise<ApiResult<string>>((done) => (resolve = done)),
    );
    render(<Harness submit={submit} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(submit).toHaveBeenCalledTimes(1);

    await act(async () => resolve({ ok: true, data: "saved" }));
  });

  it("puts a server field error on its field, focuses it and keeps what was typed", async () => {
    const submit = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: "validation_failed",
        message: "Check the fields.",
        fieldErrors: { email: ["Already invited."], other: ["x"] },
      },
    }));
    render(<Harness submit={submit} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(text("status")).toBe("error"));
    expect(text("email-error")).toBe("Already invited.");
    expect(text("server")).toBe("");
    expect(document.activeElement).toBe(screen.getByLabelText("E-mail"));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
      "Anna",
    );

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "anna@work.example" },
    });
    expect(text("email-error")).toBe("");
    expect(text("status")).toBe("error");
  });

  it("keeps a server error that has no field, such as an offline failure, and the entries", async () => {
    const submit = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: "network_error",
        message: "Could not reach the server",
        fieldErrors: { name: [] },
      },
    }));
    render(<Harness submit={submit} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(text("server")).toBe("network_error"));
    expect(text("status")).toBe("error");
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe(
      "anna@example.com",
    );
  });

  it("treats an error with only unknown fields as a form-level error", async () => {
    const submit = vi.fn(async () => ({
      ok: false as const,
      error: {
        code: "conflict",
        message: "Taken",
        fieldErrors: { elsewhere: ["Taken"] },
      },
    }));
    render(<Harness submit={submit} />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(text("server")).toBe("conflict"));
  });

  it("can clear the values after success and keep the confirmation", async () => {
    render(<Harness submit={async () => ({ ok: true, data: "saved" })} clearOnSuccess />);
    fill();

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(text("status")).toBe("success"));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  });

  it("clears everything on reset", async () => {
    render(
      <Harness
        submit={async () => ({
          ok: false,
          error: { code: "boom", message: "Boom" },
        })}
      />,
    );
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(text("server")).toBe("boom"));

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(text("server")).toBe("");
    expect(text("status")).toBe("idle");
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("");
  });
});
