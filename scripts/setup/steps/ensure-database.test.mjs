// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext, memoryFs, path } from "../test-support.mjs";
import { ensureDatabaseStep } from "./ensure-database.mjs";

const envWith = (text) => memoryFs({ [path(".env.local")]: { text } });
const URL_LINE = "DATABASE_URL=postgres://user:secret@db.local:6543/app\n";

describe("ensureDatabaseStep.check", () => {
  it("skips when the database already answers and never prints the credentials", async () => {
    const probes = [];
    const { ctx } = fakeContext({
      fs: envWith(URL_LINE),
      tcpProbe: async (...args) => probes.push(args) && true,
    });
    const reason = await ensureDatabaseStep.check(ctx);
    expect(reason).toBe("already reachable at db.local:6543");
    expect(reason).not.toContain("secret");
    expect(probes).toEqual([["db.local", 6543, 1500]]);
  });

  it("defaults to port 5432 and strips IPv6 brackets", async () => {
    const probes = [];
    const { ctx } = fakeContext({
      fs: envWith("DATABASE_URL=postgres://u:p@[::1]/app\n"),
      tcpProbe: async (...args) => probes.push(args) && false,
    });
    expect(await ensureDatabaseStep.check(ctx)).toBeNull();
    expect(probes).toEqual([["::1", 5432, 1500]]);
  });

  it("fails when .env.local or DATABASE_URL is missing", async () => {
    await expect(ensureDatabaseStep.check(fakeContext().ctx)).rejects.toThrow(/DATABASE_URL is not set/);
    await expect(ensureDatabaseStep.check(fakeContext({ fs: envWith("A=1\n") }).ctx)).rejects.toThrow(
      /DATABASE_URL is not set/,
    );
  });

  it("fails on a malformed DATABASE_URL without echoing it", async () => {
    const { ctx } = fakeContext({ fs: envWith("DATABASE_URL=not a url secret\n") });
    await expect(ensureDatabaseStep.check(ctx)).rejects.toThrow("DATABASE_URL in .env.local is not a valid URL.");
  });
});

describe("ensureDatabaseStep.run", () => {
  it("starts the compose database and waits for its healthcheck", async () => {
    const received = [];
    const { ctx } = fakeContext({ fs: envWith(URL_LINE), exec: async (...args) => received.push(args) });
    expect(await ensureDatabaseStep.run(ctx)).toBe("started with docker compose");
    expect(received).toEqual([
      ["docker", ["compose", "up", "-d", "--wait", "--wait-timeout", "60"], { cwd: "/repo" }],
    ]);
  });

  it("explains both remedies when Docker Compose is unavailable", async () => {
    const { ctx } = fakeContext({ fs: envWith(URL_LINE), tryExec: async () => false });
    await expect(ensureDatabaseStep.run(ctx)).rejects.toThrow(
      /db\.local:6543 and Docker Compose is not available.*install Docker.*start PostgreSQL yourself/s,
    );
  });
});
