// Measures contrast for every supported text/background pair from the actual values in tokens.css.
// Exits 1 when a pair falls below its threshold (4.5:1 text, 3:1 interface elements).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const tokensPath = fileURLToPath(
  new URL("../src/styles/tokens.css", import.meta.url),
);

export const PAIRS = [
  ["--foreground", "--background", 4.5],
  ["--foreground", "--card", 4.5],
  ["--foreground", "--muted", 4.5],
  ["--muted-foreground", "--background", 4.5],
  ["--muted-foreground", "--card", 4.5],
  ["--muted-foreground", "--muted", 4.5],
  ["--primary", "--background", 4.5],
  ["--primary", "--card", 4.5],
  ["--primary", "--muted", 4.5],
  ["--destructive", "--background", 4.5],
  ["--destructive", "--card", 4.5],
  ["--destructive", "--muted", 4.5],
  ["--border", "--background", 3],
  ["--border", "--card", 3],
  ["--border", "--muted", 3],
  ["--ring", "--background", 3],
  ["--ring", "--card", 3],
  ["--ring", "--muted", 3],
  ["--primary-foreground", "--primary", 4.5],
  ["--primary-foreground", "--primary-hover", 4.5],
  ["--destructive-foreground", "--destructive", 4.5],
  ["--destructive-foreground", "--destructive-hover", 4.5],
];

const blocks = (css) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selectors: selector
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split(",")
      .map((x) => x.trim()),
    vars: Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].trim(),
      ]),
    ),
  }));

const scope = (css, names) =>
  Object.assign(
    {},
    ...blocks(css)
      .filter((b) => b.selectors.some((s) => names.includes(s)))
      .map((b) => b.vars),
  );

const resolve = (vars, value) => {
  let out = value;
  for (let i = 0; i < 10 && out.includes("var("); i += 1) {
    out = out.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, n) => vars[n] ?? "");
  }
  return out;
};

const toSrgb = (oklch) => {
  const m = oklch.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  const L = Number(m[1]) / (m[2] ? 100 : 1);
  const C = Number(m[3]);
  const h = (Number(m[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  // linear sRGB, clamped to gamut
  return [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
};

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export const ratio = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export const measure = (css = readFileSync(tokensPath, "utf8")) => {
  const light = scope(css, [":root", ".light"]);
  const dark = scope(css, [":root", ".dark"]);
  return PAIRS.map(([fg, bg, min]) => {
    const get = (vars, n) => toSrgb(resolve(vars, vars[n]));
    return {
      fg,
      bg,
      min,
      light: ratio(get(light, fg), get(light, bg)),
      dark: ratio(get(dark, fg), get(dark, bg)),
    };
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = measure();
  let failed = 0;
  for (const r of rows) {
    const bad = r.light < r.min || r.dark < r.min;
    if (bad) failed += 1;
    console.log(
      `${bad ? "FAIL" : "ok  "} ${r.fg} on ${r.bg}: light ${r.light.toFixed(2)} dark ${r.dark.toFixed(2)} (min ${r.min})`,
    );
  }
  process.exit(failed ? 1 : 0);
}
