import { join } from "node:path";
import { parseEnv } from "node:util";

export const createEnvFileStep = {
  title: "Create .env.local",
  // An existing .env.local is never overwritten: local edits cannot be recovered.
  check: async ({ root, fs }) => {
    const target = join(root, ".env.local");
    if (!fs.exists(target)) {
      return null;
    }
    const hasDatabaseUrl = "DATABASE_URL" in parseEnv(fs.readText(target));
    return hasDatabaseUrl ? "already exists" : "already exists; warning: DATABASE_URL is missing";
  },
  run: async ({ root, fs }) => {
    const example = join(root, ".env.example");
    if (!fs.exists(example)) {
      throw new Error(`${example} was not found, so .env.local cannot be created.`);
    }
    fs.copyNew(example, join(root, ".env.local"));
    return "copied from .env.example";
  },
};
