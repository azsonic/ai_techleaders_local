// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext, memoryFs, path } from "../test-support.mjs";
import { parseNodeFloor, preflightStep } from "./preflight.mjs";

const withEngines = (range, nodeVersion) =>
  fakeContext({
    nodeVersion,
    fs: memoryFs({ [path("package.json")]: { text: JSON.stringify(range ? { engines: { node: range } } : {}) } }),
  }).ctx;

describe("parseNodeFloor", () => {
  it("reads major.minor and major.minor.patch", () => {
    expect(parseNodeFloor(">=22.17")).toEqual([22, 17, 0]);
    expect(parseNodeFloor(">= 20.1.3")).toEqual([20, 1, 3]);
  });

  it("rejects ranges it cannot read", () => {
    expect(() => parseNodeFloor("^22")).toThrow(/Cannot read the Node.js requirement/);
    expect(() => parseNodeFloor(undefined)).toThrow(/undefined/);
  });
});

describe("preflightStep", () => {
  it("never skips", async () => {
    expect(await preflightStep.check()).toBeNull();
  });

  it("accepts equal, newer minor and newer major versions", async () => {
    expect(await preflightStep.run(withEngines(">=22.17", "22.17.0"))).toBe("Node.js 22.17.0");
    expect(await preflightStep.run(withEngines(">=22.17", "22.22.3"))).toBe("Node.js 22.22.3");
    expect(await preflightStep.run(withEngines(">=22.17", "24.0.0"))).toBe("Node.js 24.0.0");
  });

  it("rejects older patch, minor and major versions", async () => {
    await expect(preflightStep.run(withEngines(">=22.17.2", "22.17.1"))).rejects.toThrow(/found 22.17.1/);
    await expect(preflightStep.run(withEngines(">=22.17", "22.16.9"))).rejects.toThrow(
      "Node.js 22.17 or newer is required, found 22.16.9. Nothing was changed.",
    );
    await expect(preflightStep.run(withEngines(">=22.17", "20.19.0"))).rejects.toThrow(/found 20.19.0/);
  });

  it("fails when package.json has no engines.node", async () => {
    await expect(preflightStep.run(withEngines(undefined, "22.22.3"))).rejects.toThrow(/Cannot read/);
  });
});
