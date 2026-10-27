// Checks that the three component lists of the design system name the same components:
// the agent summary (docs/design-system.md), the "All components" table on Start here, and the
// Components page. Exits 1 when they differ, so a component cannot be added to one and forgotten in another.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCES = [
  {
    name: "docs/design-system.md",
    path: "docs/design-system.md",
    kind: "table",
    start: "## Components",
  },
  {
    name: "Start here",
    path: "packages/ui/stories/design-system/start-here.mdx",
    kind: "table",
    start: "## All components",
  },
  {
    name: "Components page",
    path: "packages/ui/stories/design-system/components.mdx",
    kind: "headings",
  },
];

const tableNames = (source, start) => {
  const from = source.indexOf(start);
  const to = source.indexOf("\n## ", from + start.length);
  return source
    .slice(from, to === -1 ? undefined : to)
    .split("\n")
    .filter((line) => line.startsWith("| ") && !/^\| (-|Component )/.test(line))
    .map((line) => line.split("|")[1].trim());
};

const headingNames = (source) => {
  const shared = tableNames(source, "## Shared parts").filter(
    (name) => name !== "Part",
  );
  return [...source.matchAll(/^### (.+)$/gm)]
    .map((match) => match[1])
    .concat(shared);
};

export const componentNames = (root, { path, kind, start }) => {
  const source = readFileSync(join(root, path), "utf8");
  return new Set(
    kind === "table" ? tableNames(source, start) : headingNames(source),
  );
};

export const check = (root) => {
  const lists = SOURCES.map((source) => ({
    name: source.name,
    names: componentNames(root, source),
  }));
  const all = new Set(lists.flatMap(({ names }) => [...names]));
  return lists.flatMap(({ name, names }) =>
    [...all].filter((n) => !names.has(n)).map((n) => ({ name, missing: n })),
  );
};

export const main = (root, log = console.log) => {
  const problems = check(root);
  for (const { name, missing } of problems)
    log(`${name} does not list "${missing}"`);
  log(
    problems.length
      ? `${problems.length} component list mismatch(es).`
      : "Component lists match.",
  );
  return problems.length ? 1 : 0;
};
