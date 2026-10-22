import { join } from "node:path";

export const installDependenciesStep = {
  title: "Install dependencies",
  // npm writes node_modules/.package-lock.json after installing, so a hidden lockfile that is
  // at least as new as package-lock.json means the install is current.
  check: async ({ root, fs }) => {
    const installed = join(root, "node_modules", ".package-lock.json");
    const lockfile = join(root, "package-lock.json");
    if (!fs.exists(installed) || !fs.exists(lockfile)) {
      return null;
    }
    return fs.mtimeMs(installed) >= fs.mtimeMs(lockfile) ? "already installed" : null;
  },
  run: async ({ root, exec }) => {
    await exec("npm", ["install"], { cwd: root });
  },
};
