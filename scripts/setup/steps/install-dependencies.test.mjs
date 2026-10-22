// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext, memoryFs, path } from "../test-support.mjs";
import { installDependenciesStep } from "./install-dependencies.mjs";

const hidden = path("node_modules", ".package-lock.json");
const lock = path("package-lock.json");

const check = (files) => installDependenciesStep.check(fakeContext({ fs: memoryFs(files) }).ctx);

describe("installDependenciesStep", () => {
  it("runs when node_modules has no hidden lockfile", async () => {
    expect(await check({ [lock]: { mtimeMs: 1 } })).toBeNull();
  });

  it("runs when there is no package-lock.json", async () => {
    expect(await check({ [hidden]: { mtimeMs: 1 } })).toBeNull();
  });

  it("runs when package-lock.json is newer than the install", async () => {
    expect(await check({ [hidden]: { mtimeMs: 1 }, [lock]: { mtimeMs: 2 } })).toBeNull();
  });

  it("skips when the install is newer than, or as new as, package-lock.json", async () => {
    expect(await check({ [hidden]: { mtimeMs: 3 }, [lock]: { mtimeMs: 2 } })).toBe("already installed");
    expect(await check({ [hidden]: { mtimeMs: 2 }, [lock]: { mtimeMs: 2 } })).toBe("already installed");
  });

  it("runs npm install in the repo root", async () => {
    const { ctx, calls } = fakeContext();
    const received = [];
    ctx.exec = async (...args) => received.push(args);
    await installDependenciesStep.run(ctx);
    expect(received).toEqual([["npm", ["install"], { cwd: "/repo" }]]);
    expect(calls).toEqual([]);
  });
});
