// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext, memoryFs, path, root } from "./test-support.mjs";

describe("test support", () => {
  it("memoryFs reads, stats and copies files without overwriting", () => {
    const files = { a: { text: "x", mtimeMs: 5 } };
    const fs = memoryFs(files);
    expect(fs.exists("a")).toBe(true);
    expect(fs.exists("b")).toBe(false);
    expect(fs.mtimeMs("a")).toBe(5);
    expect(fs.readText("a")).toBe("x");
    fs.copyNew("a", "b");
    expect(files.b).toEqual(files.a);
    expect(() => fs.copyNew("a", "b")).toThrow(/already exists/);
  });

  it("fakeContext records commands and logs, with safe defaults", async () => {
    const { ctx, calls, lines } = fakeContext();
    await ctx.exec("npm", ["x"]);
    ctx.log("hello");
    expect(calls).toEqual([["npm", "x"]]);
    expect(lines).toEqual(["hello"]);
    expect(await ctx.tryExec()).toBe(true);
    expect(await ctx.tcpProbe()).toBe(false);
    expect(ctx.fs.exists("nothing")).toBe(false);
    expect(path("a", "b")).toBe(`${root}/a/b`);
  });
});
