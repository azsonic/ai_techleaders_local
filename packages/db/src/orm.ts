import "server-only";

import { MikroORM } from "@mikro-orm/postgresql";

import { createOrmConfig } from "./config";

// Cached on globalThis so dev hot reloads reuse one pool instead of opening a new one per reload.
const globalForOrm = globalThis as typeof globalThis & {
  __devmentorOrm?: Promise<MikroORM>;
};

export function getOrm(): Promise<MikroORM> {
  globalForOrm.__devmentorOrm ??= MikroORM.init(createOrmConfig()).catch((error: unknown) => {
    globalForOrm.__devmentorOrm = undefined;
    throw error;
  });
  return globalForOrm.__devmentorOrm;
}
