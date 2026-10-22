import { join } from "node:path";
import { parseEnv } from "node:util";

const PROBE_TIMEOUT_MS = 1500;

/** Host and port of `DATABASE_URL` in `.env.local`. Never exposes the credentials. */
function readDatabaseTarget({ root, fs }) {
  const envFile = join(root, ".env.local");
  const url = fs.exists(envFile) ? parseEnv(fs.readText(envFile)).DATABASE_URL : undefined;
  if (!url) {
    throw new Error("DATABASE_URL is not set in .env.local. Add it (see .env.example) and run setup again.");
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL in .env.local is not a valid URL.");
  }
  return { host: parsed.hostname.replace(/^\[|\]$/g, ""), port: Number(parsed.port || 5432) };
}

export const ensureDatabaseStep = {
  title: "Ensure PostgreSQL is running",
  // Any database that already answers at DATABASE_URL counts, so "any PostgreSQL instance" works.
  check: async (ctx) => {
    const { host, port } = readDatabaseTarget(ctx);
    return (await ctx.tcpProbe(host, port, PROBE_TIMEOUT_MS)) ? `already reachable at ${host}:${port}` : null;
  },
  run: async (ctx) => {
    const { host, port } = readDatabaseTarget(ctx);
    if (!(await ctx.tryExec("docker", ["compose", "version"]))) {
      throw new Error(
        `Nothing answers at ${host}:${port} and Docker Compose is not available. ` +
          "Either install Docker, or start PostgreSQL yourself and point DATABASE_URL in .env.local at it.",
      );
    }
    await ctx.exec("docker", ["compose", "up", "-d", "--wait", "--wait-timeout", "60"], { cwd: ctx.root });
    return "started with docker compose";
  },
};
