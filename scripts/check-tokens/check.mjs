// Finds values that bypass the design tokens: colour literals, Tailwind palette classes and
// arbitrary Tailwind values. Exits 1 when any are found, so it can run in CI.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SCAN_ROOTS = ["packages/ui/src", "packages/ui/stories", "packages/ui/.storybook", "packages/app/src"];
const EXTENSIONS = /\.(css|ts|tsx|mdx)$/;
const SKIPPED = /(\.test\.[mc]?[jt]sx?$|[\\/]tokens\.css$|[\\/]node_modules[\\/])/;

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOUR_PREFIX =
  "bg|text|border|ring|ring-offset|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|shadow|placeholder";
const SIZING_PREFIX =
  "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|w|h|min-w|min-h|max-w|max-h|size|top|right|bottom|left|inset|inset-x|inset-y|text|leading|tracking|rounded|rounded-[a-z]{1,2}|border|border-[xytrblse]|bg|ring|shadow|z|opacity|translate-[xy]|basis|columns";

export const RULES = [
  { id: "colour-literal", message: "colour literal outside the token file", pattern: /(?<![\w&/-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b(?![-\w])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[\d.%-]/g },
  { id: "palette-class", message: "Tailwind palette class", pattern: new RegExp(`(?<![\\w-])(?:${COLOUR_PREFIX})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?![\\w-])`, "g") },
  { id: "arbitrary-value", message: "arbitrary Tailwind value", pattern: new RegExp(`(?<![\\w-])(?:[\\w-]+:)*-?(?:${SIZING_PREFIX})-\\[(?![^\\]]*var\\(--)[^\\]\\s]+\\]`, "g") },
];

export const findViolations = (file, source) =>
  source.split("\n").flatMap((text, index) =>
    RULES.flatMap(({ id, message, pattern }) =>
      [...text.matchAll(pattern)].map((m) => ({ file, line: index + 1, rule: id, message, match: m[0] })),
    ),
  );

export const listFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (SKIPPED.test(path)) return [];
    if (statSync(path).isDirectory()) return listFiles(path);
    return EXTENSIONS.test(path) ? [path] : [];
  });

export const check = (root) =>
  SCAN_ROOTS.flatMap((r) => {
    try {
      return listFiles(join(root, r));
    } catch {
      return [];
    }
  }).flatMap((file) => findViolations(relative(root, file), readFileSync(file, "utf8")));

export const main = (root, log = console.log) => {
  const violations = check(root);
  for (const v of violations) log(`${v.file}:${v.line}  ${v.rule}  ${v.match}  (${v.message})`);
  log(violations.length ? `${violations.length} non-token value(s) found.` : "No non-token values found.");
  return violations.length ? 1 : 0;
};
