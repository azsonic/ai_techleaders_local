// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext } from "../test-support.mjs";
import { migrateDatabaseStep } from "./migrate-database.mjs";

describe("migrateDatabaseStep", () => {
  it("never skips", async () => {
    expect(await migrateDatabaseStep.check()).toBeNull();
  });

  it("runs db:migrate in the repo root", async () => {
    const received = [];
    const { ctx } = fakeContext({ exec: async (...args) => received.push(args) });
    expect(await migrateDatabaseStep.run(ctx)).toBe("schema up to date");
    expect(received).toEqual([["npm", ["run", "db:migrate"], { cwd: "/repo" }]]);
  });

  it("surfaces a failing migration", async () => {
    const { ctx } = fakeContext({
      exec: async () => {
        throw new Error("npm run db:migrate exited with code 1");
      },
    });
    await expect(migrateDatabaseStep.run(ctx)).rejects.toThrow(/exited with code 1/);
  });
});
