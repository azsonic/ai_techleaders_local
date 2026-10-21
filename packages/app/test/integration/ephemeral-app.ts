import { spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "../..");
const repoRoot = resolve(here, "../../..");
const require = createRequire(resolve(appDir, "package.json"));

export interface EphemeralApp {
  url: string;
  stop: () => Promise<void>;
}

export async function startEphemeralApp(): Promise<EphemeralApp> {
  if (!existsSync(resolve(appDir, ".next/BUILD_ID"))) {
    throw new Error("Missing production build. Run npm run test:integration from the repo root.");
  }

  const container = await new PostgreSqlContainer("postgres:17-alpine").start();
  let child: ChildProcess | undefined;
  const logs: string[] = [];

  try {
    const databaseUrl = container.getConnectionUri();
    await run("npm", ["run", "db:migrate"], { ...process.env, DATABASE_URL: databaseUrl }, repoRoot);
    const port = await freePort();
    child = startNext(databaseUrl, port, logs);
    const url = `http://127.0.0.1:${port}`;
    await waitForHttp(url, child, logs);
    return {
      url,
      stop: async () => {
        await stopProcess(child);
        await container.stop();
      },
    };
  } catch (error) {
    if (child) {
      await stopProcess(child);
    }
    await container.stop();
    const detail = logs.join("");
    if (detail && error instanceof Error) {
      error.message = `${error.message}\n${detail}`;
    }
    throw error;
  }
}

function startNext(databaseUrl: string, port: number, logs: string[]): ChildProcess {
  const nextBin = require.resolve("next/dist/bin/next");
  const child = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: appDir,
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "production", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const record = (chunk: Buffer) => {
    logs.push(chunk.toString());
  };
  child.stdout?.on("data", record);
  child.stderr?.on("data", record);
  return child;
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv, cwd: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${code}\n${output}`));
    });
  });
}

function freePort(): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error("Could not reserve a port"));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolvePromise(port)));
    });
  });
}

async function waitForHttp(url: string, child: ChildProcess, logs: string[]): Promise<void> {
  const deadline = Date.now() + 60_000;
  let lastError = "no response";
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited with ${child.exitCode}\n${logs.join("")}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}\n${logs.join("")}`);
}

function stopProcess(child: ChildProcess | undefined): Promise<void> {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolvePromise) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, 5_000);
    child.once("exit", () => {
      clearTimeout(timer);
      resolvePromise();
    });
    child.kill("SIGTERM");
  });
}
