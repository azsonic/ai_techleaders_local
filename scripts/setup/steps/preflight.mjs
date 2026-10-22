import { join } from "node:path";

import { runAlways } from "../run-steps.mjs";

/** Reads the `[major, minor, patch]` floor from an `engines.node` range such as `>=22.17`. */
export function parseNodeFloor(range) {
  const match = /^>=\s*(\d+)\.(\d+)(?:\.(\d+))?$/.exec(range ?? "");
  if (!match) {
    throw new Error(`Cannot read the Node.js requirement from package.json engines.node (${range}).`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
}

function isAtLeast(version, floor) {
  // parseInt keeps prerelease builds such as "22.17.0-nightly2025" comparable.
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  for (let i = 0; i < 3; i += 1) {
    if (parts[i] !== floor[i]) {
      return parts[i] > floor[i];
    }
  }
  return true;
}

export const preflightStep = {
  title: "Check Node.js version",
  check: runAlways,
  run: async ({ root, fs, nodeVersion }) => {
    const range = JSON.parse(fs.readText(join(root, "package.json"))).engines?.node;
    const floor = parseNodeFloor(range);
    if (!isAtLeast(nodeVersion, floor)) {
      throw new Error(`Node.js ${range.replace(">=", "")} or newer is required, found ${nodeVersion}. Nothing was changed.`);
    }
    return `Node.js ${nodeVersion}`;
  },
};
