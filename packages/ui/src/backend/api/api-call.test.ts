import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiCallError, apiCall, apiCallOrThrow } from "./api-call";

const fetchMock = vi.fn();

function textResponse(raw: string) {
  return { text: async () => raw };
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("apiCall", () => {
  it("sends the CSRF header and returns a successful envelope", async () => {
    fetchMock.mockResolvedValue(textResponse(JSON.stringify({ ok: true, data: { status: "ok" } })));

    await expect(apiCall<{ status: string }>("/api/health")).resolves.toEqual({
      ok: true,
      data: { status: "ok" },
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/health", expect.objectContaining({ headers: expect.any(Headers) }));
    const headers = fetchMock.mock.calls[0]?.[1].headers as Headers;
    expect(headers.get("x-devmentor-request")).toBe("1");
    expect(headers.get("accept")).toBe("application/json");
  });

  it("keeps caller headers and the request method", async () => {
    fetchMock.mockResolvedValue(textResponse(JSON.stringify({ ok: true, data: null })));

    await apiCall("/api/health", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Headers;
    expect(init.method).toBe("POST");
    expect(init.body).toBe("{}");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-devmentor-request")).toBe("1");
  });

  it("returns a network error when fetch throws", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    await expect(apiCall("/api/health")).resolves.toEqual({
      ok: false,
      error: { code: "network_error", message: "Could not reach the server" },
    });
  });

  it("returns an invalid response when the body is not the envelope", async () => {
    const bodies = [
      "",
      "{",
      "null",
      "1",
      '"hi"',
      "{}",
      JSON.stringify({ ok: true }),
      JSON.stringify({ ok: false }),
      JSON.stringify({ ok: false, error: null }),
      JSON.stringify({ ok: false, error: {} }),
      JSON.stringify({ ok: false, error: { code: 1, message: "x" } }),
      JSON.stringify({ ok: false, error: { code: "x" } }),
      JSON.stringify({ ok: false, error: { message: "x" } }),
      JSON.stringify({ ok: false, error: { code: "x", message: 1 } }),
      JSON.stringify({ ok: "yes", data: 1 }),
    ];

    for (const raw of bodies) {
      fetchMock.mockResolvedValueOnce(textResponse(raw));
      await expect(apiCall("/api/health")).resolves.toEqual({
        ok: false,
        error: { code: "invalid_response", message: "The server sent an unexpected response" },
      });
    }
  });

  it("treats an unreadable body as an invalid response", async () => {
    fetchMock.mockResolvedValue({
      text: () => Promise.reject(new Error("read failed")),
    });

    await expect(apiCall("/api/health")).resolves.toMatchObject({
      ok: false,
      error: { code: "invalid_response" },
    });
  });

  it("returns a failed envelope unchanged", async () => {
    const error = { code: "database_unavailable", message: "Database is unavailable", fieldErrors: { db: ["down"] } };
    fetchMock.mockResolvedValue(textResponse(JSON.stringify({ ok: false, error })));

    await expect(apiCall("/api/health")).resolves.toEqual({ ok: false, error });
  });
});

describe("apiCallOrThrow", () => {
  it("returns the data", async () => {
    fetchMock.mockResolvedValue(textResponse(JSON.stringify({ ok: true, data: { status: "ok" } })));

    await expect(apiCallOrThrow("/api/health")).resolves.toEqual({ status: "ok" });
  });

  it("throws ApiCallError with the server error", async () => {
    fetchMock.mockResolvedValue(
      textResponse(
        JSON.stringify({
          ok: false,
          error: { code: "validation_failed", message: "Invalid", fieldErrors: { email: ["Required"] } },
        }),
      ),
    );

    const error = await apiCallOrThrow("/api/health").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiCallError);
    expect(error).toMatchObject({
      name: "ApiCallError",
      message: "Invalid",
      code: "validation_failed",
      fieldErrors: { email: ["Required"] },
    });
  });

  it("throws ApiCallError when the response is not the envelope", async () => {
    fetchMock.mockResolvedValue(textResponse(""));

    await expect(apiCallOrThrow("/api/health")).rejects.toMatchObject({ code: "invalid_response" });
  });
});
