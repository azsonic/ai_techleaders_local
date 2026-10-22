import { spawn } from "node:child_process";
import { constants, copyFileSync, existsSync, readFileSync, statSync } from "node:fs";
import net from "node:net";

/**
 * Runs a command without a shell. Rejects when it cannot start or exits non-zero.
 * Output is shown live unless `quiet` is set.
 */
function exec(command, args, { cwd, quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: quiet ? "ignore" : "inherit" });
    child.once("error", (error) => reject(new Error(`Could not run ${command}: ${error.message}`)));
    child.once("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with code ${code}.`)),
    );
  });
}

const tryExec = (command, args) =>
  exec(command, args, { quiet: true }).then(
    () => true,
    () => false,
  );

/** Resolves true when a TCP connection to `host:port` succeeds within `timeoutMs`. */
function tcpProbe(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const finish = (reachable) => {
      socket.destroy();
      resolve(reachable);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}

const fs = {
  exists: existsSync,
  mtimeMs: (path) => statSync(path).mtimeMs,
  readText: (path) => readFileSync(path, "utf8"),
  // COPYFILE_EXCL makes the copy fail instead of overwriting a file that appeared meanwhile.
  copyNew: (from, to) => copyFileSync(from, to, constants.COPYFILE_EXCL),
};

/** The real adapters the installer steps run against: the only impure module. */
export function createSystem() {
  return { exec, tryExec, tcpProbe, fs, log: console.log, nodeVersion: process.versions.node };
}
