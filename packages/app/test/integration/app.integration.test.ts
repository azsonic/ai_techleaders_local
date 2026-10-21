import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { browser } from "./browser";
import { startEphemeralApp, type EphemeralApp } from "./ephemeral-app";

describe("ephemeral app", () => {
  const session = `devmentor-${process.pid}`;
  let app: EphemeralApp | undefined;

  beforeAll(async () => {
    app = await startEphemeralApp();
  });

  afterAll(async () => {
    await browser(session, ["close"]).catch(() => undefined);
    await app?.stop();
  });

  it("opens the home page and reports a healthy database on the admin page", async () => {
    await browser(session, ["open", app!.url]);
    await browser(session, ["wait", "--text", "Grow as a developer, one session at a time."]);

    const title = await browser(session, ["get", "title"]);
    expect(title).toContain("DevMentor");

    await browser(session, ["find", "role", "link", "click", "--name", "Go to admin", "--exact"]);
    await browser(session, ["wait", "--url", "**/admin"]);
    await browser(session, ["wait", "--text", "Database connection is healthy."]);
  });
});
