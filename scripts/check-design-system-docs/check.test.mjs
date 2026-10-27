// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { check, componentNames, main } from "./check.mjs";

const dirs = [];
const table = (heading, names, tail = "") =>
  `${heading}\n\n| Component | Import |\n| --- | --- |\n${names.map((n) => `| ${n} | x |`).join("\n")}\n${tail}`;
const makeRoot = ({ summary, startHere, components }) => {
  const root = mkdtempSync(join(tmpdir(), "check-docs-"));
  dirs.push(root);
  const files = {
    "docs/design-system.md": `# Summary\n\n${summary}`,
    "packages/ui/stories/design-system/start-here.mdx": `# Start\n\n${startHere}`,
    "packages/ui/stories/design-system/components.mdx": components,
  };
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
};
const headings = (names) => names.map((n) => `### ${n}\n\ntext`).join("\n\n");
const shared = (names) =>
  `\n\n## Shared parts\n\n| Part | Import |\n| --- | --- |\n${names.map((n) => `| ${n} | x |`).join("\n")}\n`;

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe("componentNames", () => {
  it("reads a table section up to the next heading, ignoring header and separator rows", () => {
    const root = makeRoot({
      summary: `${table("## Components", ["Button", "Card"])}\n## Patterns\n\n| Screen | Pattern |\n| x | y |\n`,
      startHere: table("## All components", ["Button"]),
      components: "",
    });

    expect(
      componentNames(root, {
        path: "docs/design-system.md",
        kind: "table",
        start: "## Components",
      }),
    ).toEqual(new Set(["Button", "Card"]));
  });

  it("reads headings and the shared parts table from the components page", () => {
    const root = makeRoot({
      summary: "",
      startHere: "",
      components: `${headings(["Button", "Card"])}${shared(["useForm"])}`,
    });

    expect(
      componentNames(root, {
        path: "packages/ui/stories/design-system/components.mdx",
        kind: "headings",
      }),
    ).toEqual(new Set(["Button", "Card", "useForm"]));
  });
});

describe("check and main", () => {
  const consistent = () =>
    makeRoot({
      summary: table("## Components", ["Button", "Card"]),
      startHere: table("## All components", ["Button", "Card"]),
      components: `${headings(["Button", "Card"])}${shared(["Part"]).replace("| Part | x |\n", "")}`,
    });

  it("finds nothing when the three lists match", () => {
    const log = vi.fn();
    expect(check(consistent())).toEqual([]);
    expect(main(consistent(), log)).toBe(0);
    expect(log).toHaveBeenLastCalledWith("Component lists match.");
  });

  it("names each list that misses a component", () => {
    const root = makeRoot({
      summary: table("## Components", ["Button"]),
      startHere: table("## All components", ["Button", "Card"]),
      components: `${headings(["Button", "Card"])}${shared([])}`,
    });
    const log = vi.fn();

    expect(check(root)).toEqual([
      { name: "docs/design-system.md", missing: "Card" },
    ]);
    expect(main(root, log)).toBe(1);
    expect(log).toHaveBeenCalledWith(
      'docs/design-system.md does not list "Card"',
    );
    expect(log).toHaveBeenLastCalledWith("1 component list mismatch(es).");
  });

  it("logs to the console by default", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    expect(main(consistent())).toBe(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
