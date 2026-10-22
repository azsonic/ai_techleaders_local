// @vitest-environment node
import { EventEmitter } from "node:events";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createSystem } from "./system.mjs";

const system = createSystem();
const node = process.execPath;
const dirs = [];
const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "setup-system-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("createSystem", () => {
  it("exposes the current Node version and a logger", () => {
    expect(system.nodeVersion).toBe(process.versions.node);
    expect(system.log).toBe(console.log);
  });
});

describe("exec", () => {
  it("runs a command in the given directory", async () => {
    const dir = tempDir();
    await system.exec(node, ["-e", "require('fs').writeFileSync('out.txt', process.cwd())"], { cwd: dir });
    expect(readFileSync(join(dir, "out.txt"), "utf8")).toContain("setup-system-");
  });

  it("rejects with the exit code when the command fails", async () => {
    await expect(system.exec(node, ["-e", "process.exit(3)"])).rejects.toThrow(/exited with code 3\./);
  });

  it("rejects when the command cannot start", async () => {
    await expect(system.exec("definitely-not-a-command-xyz", [])).rejects.toThrow(
      /Could not run definitely-not-a-command-xyz/,
    );
  });
});

describe("tryExec", () => {
  it("resolves true on success and false on failure, quietly", async () => {
    expect(await system.tryExec(node, ["-e", ""])).toBe(true);
    expect(await system.tryExec(node, ["-e", "process.exit(1)"])).toBe(false);
    expect(await system.tryExec("definitely-not-a-command-xyz", [])).toBe(false);
  });
});

describe("tcpProbe", () => {
  it("is true for a listening port and false for a closed one", async () => {
    const server = net.createServer().listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    expect(await system.tcpProbe("127.0.0.1", port, 1000)).toBe(true);
    await new Promise((resolve) => server.close(resolve));
    expect(await system.tcpProbe("127.0.0.1", port, 1000)).toBe(false);
  });

  it("is false when the connection times out", async () => {
    const socket = Object.assign(new EventEmitter(), { setTimeout: vi.fn(), destroy: vi.fn() });
    vi.spyOn(net, "connect").mockReturnValue(socket);
    const probe = system.tcpProbe("10.255.255.1", 5432, 5);
    socket.emit("timeout");
    expect(await probe).toBe(false);
    expect(socket.setTimeout).toHaveBeenCalledWith(5);
    expect(socket.destroy).toHaveBeenCalled();
  });
});

describe("fs", () => {
  it("checks, stats, reads and copies without overwriting", () => {
    const dir = tempDir();
    const from = join(dir, "from.txt");
    const to = join(dir, "to.txt");
    writeFileSync(from, "hello");
    expect(system.fs.exists(from)).toBe(true);
    expect(system.fs.exists(to)).toBe(false);
    expect(system.fs.mtimeMs(from)).toBe(statSync(from).mtimeMs);
    expect(system.fs.readText(from)).toBe("hello");
    system.fs.copyNew(from, to);
    expect(readFileSync(to, "utf8")).toBe("hello");
    writeFileSync(to, "mine");
    expect(() => system.fs.copyNew(from, to)).toThrow(/EEXIST/);
    expect(readFileSync(to, "utf8")).toBe("mine");
  });
});
