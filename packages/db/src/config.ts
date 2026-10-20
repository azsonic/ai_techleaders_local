import { defineConfig, type Options } from "@mikro-orm/postgresql";

import { entities } from "./entities";

export function createOrmConfig(overrides: Partial<Options> = {}): Options {
  const clientUrl = process.env.DATABASE_URL;
  if (!clientUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local at the repo root.");
  }

  return defineConfig({
    clientUrl,
    entities,
    pool: {
      min: 0,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
    },
    discovery: {
      // Remove once the first entity is added to `entities`.
      warnWhenNoEntities: entities.length > 0,
    },
    debug: process.env.NODE_ENV === "development" && process.env.DATABASE_DEBUG === "true",
    ...overrides,
  });
}
