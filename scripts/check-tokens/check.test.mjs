// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { check, findViolations, listFiles, main } from "./check.mjs";

const dirs = [];
const makeRoot = (files) => {
  const root = mkdtempSync(join(tmpdir(), "check-tokens-"));
  dirs.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
};

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  vi.resetModules();
  vi.doUnmock("./check.mjs");
});

describe("findViolations", () => {
  it.each([
    ["colour-literal", 'color: #fff;'],
    ["colour-literal", 'color: #1a2b3c;'],
    ["colour-literal", "color: rgb(0 0 0);"],
    ["colour-literal", "color: oklch(50% 0.1 20);"],
    ["palette-class", '<p className="bg-zinc-900 text-white">'],
    ["palette-class", '<p className="hover:border-red-500">'],
    ["arbitrary-value", '<p className="p-[13px]">'],
    ["arbitrary-value", '<p className="md:text-[0.8rem]">'],
  ])("flags %s in %s", (rule, line) => {
    const found = findViolations("a.tsx", line);
    expect(found.some((v) => v.rule === rule)).toBe(true);
  });

  it.each([
    '<p className="bg-background text-foreground p-panel">',
    '<p className="rounded-[min(var(--radius-md),10px)]">',
    '<p className="grid-cols-[1fr_auto] aria-[haspopup]:flex">',
    '<a href="#section-intro">',
    "color: var(--foreground);",
  ])("ignores token-based line %s", (line) => {
    expect(findViolations("a.tsx", line)).toEqual([]);
  });

  it("reports file, line and the matched text", () => {
    const [v] = findViolations("x.css", "a {}\nb { color: #abc; }");
    expect(v).toMatchObject({ file: "x.css", line: 2, rule: "colour-literal", match: "#abc" });
  });
});

describe("listFiles and check", () => {
  it("skips tests, the token file and unsupported extensions, and recurses", () => {
    const root = makeRoot({
      "packages/ui/src/a.tsx": "x",
      "packages/ui/src/deep/b.css": "x",
      "packages/ui/src/c.test.tsx": "x",
      "packages/ui/src/styles/tokens.css": "x",
      "packages/ui/src/readme.md": "x",
    });
    const files = listFiles(join(root, "packages/ui/src")).map((f) => f.slice(root.length + 1)).sort();
    expect(files).toEqual(["packages/ui/src/a.tsx", "packages/ui/src/deep/b.css"]);
  });

  it("collects violations and tolerates missing scan roots", () => {
    const root = makeRoot({
      "packages/ui/src/a.tsx": '<p className="bg-white">',
      "packages/ui/src/styles/tokens.css": "a { color: #fff; }",
    });
    expect(check(root)).toHaveLength(1);
  });
});

describe("main", () => {
  it("returns 1 and logs each violation", () => {
    const root = makeRoot({ "packages/app/src/a.tsx": '<p className="text-zinc-600">' });
    const log = vi.fn();
    expect(main(root, log)).toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("packages/app/src/a.tsx:1"));
    expect(log).toHaveBeenLastCalledWith("1 non-token value(s) found.");
  });

  it("returns 0 for a clean tree", () => {
    const root = makeRoot({ "packages/app/src/a.tsx": '<p className="text-foreground">' });
    const log = vi.fn();
    expect(main(root, log)).toBe(0);
    expect(log).toHaveBeenLastCalledWith("No non-token values found.");
  });

  it("logs to the console by default", () => {
    const root = makeRoot({});
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(main(root)).toBe(0);
    expect(spy).toHaveBeenCalled();
  });
});
