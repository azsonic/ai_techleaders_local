// @vitest-environment node
import { describe, expect, it } from "vitest";

import { main, steps } from "./main.mjs";
import { fakeContext, memoryFs, path } from "./test-support.mjs";

const files = () => ({
  [path("package.json")]: { text: JSON.stringify({ engines: { node: ">=22.17" } }) },
  [path("package-lock.json")]: { mtimeMs: 1 },
  [path(".env.example")]: { text: "DATABASE_URL=postgres://u:p@localhost:5432/db\n" },
});

describe("main", () => {
  it("lists the steps in README order", () => {
    expect(steps.map((step) => step.title)).toEqual([
      "Check Node.js version",
      "Install dependencies",
      "Create .env.local",
      "Ensure PostgreSQL is running",
      "Apply database migrations",
    ]);
  });

  it("runs every step on a fresh machine, then prints the next step", async () => {
    const { ctx, calls, lines } = fakeContext({ fs: memoryFs(files()) });
    const { root, ...system } = ctx;
    expect(await main({ root, system })).toBe(0);
    expect(calls).toEqual([
      ["npm", "install"],
      ["docker", "compose", "up", "-d", "--wait", "--wait-timeout", "60"],
      ["npm", "run", "db:migrate"],
    ]);
    expect(lines.slice(0, 5)).toEqual([
      "[done]    Check Node.js version (Node.js 22.22.3)",
      "[done]    Install dependencies",
      "[done]    Create .env.local (copied from .env.example)",
      "[done]    Ensure PostgreSQL is running (started with docker compose)",
      "[done]    Apply database migrations (schema up to date)",
    ]);
    expect(lines.at(-1)).toContain("Next: npm run dev");
  });

  it("skips finished steps on a second run and changes nothing", async () => {
    const state = {
      ...files(),
      [path("node_modules", ".package-lock.json")]: { mtimeMs: 2 },
      [path(".env.local")]: { text: "DATABASE_URL=postgres://u:p@localhost:5432/db\n" },
    };
    const before = JSON.stringify(state);
    const { ctx, calls, lines } = fakeContext({ fs: memoryFs(state), tcpProbe: async () => true });
    const { root, ...system } = ctx;
    expect(await main({ root, system })).toBe(0);
    expect(calls).toEqual([["npm", "run", "db:migrate"]]);
    expect(lines.slice(1, 4)).toEqual([
      "[skipped] Install dependencies (already installed)",
      "[skipped] Create .env.local (already exists)",
      "[skipped] Ensure PostgreSQL is running (already reachable at localhost:5432)",
    ]);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("stops with exit code 1 and no closing hint when a step fails", async () => {
    const { ctx, calls, lines } = fakeContext({ fs: memoryFs(files()), nodeVersion: "20.0.0" });
    const { root, ...system } = ctx;
    expect(await main({ root, system })).toBe(1);
    expect(calls).toEqual([]);
    expect(lines[0]).toBe("[failed]  Check Node.js version");
    expect(lines.join("\n")).not.toContain("Setup complete");
  });
});
