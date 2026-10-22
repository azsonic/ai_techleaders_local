import { join } from "node:path";

export const root = "/repo";

/** An in-memory stand-in for the `fs` adapter. `files` maps a path to `{ text, mtimeMs }`. */
export function memoryFs(files = {}) {
  return {
    exists: (path) => path in files,
    mtimeMs: (path) => files[path].mtimeMs,
    readText: (path) => files[path].text,
    copyNew: (from, to) => {
      if (to in files) {
        throw new Error(`${to} already exists`);
      }
      files[to] = { ...files[from] };
    },
  };
}

/** A context whose commands record calls instead of running anything. */
export function fakeContext(overrides = {}) {
  const calls = [];
  const lines = [];
  const ctx = {
    root,
    nodeVersion: "22.22.3",
    fs: memoryFs(),
    log: (line) => lines.push(line),
    exec: async (command, args) => {
      calls.push([command, ...args]);
    },
    tryExec: async () => true,
    tcpProbe: async () => false,
    ...overrides,
  };
  return { ctx, calls, lines };
}

export const path = (...parts) => join(root, ...parts);
