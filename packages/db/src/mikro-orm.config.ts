// MikroORM CLI entry point only — the app uses `createOrmConfig()` via `getOrm()`.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { Migrator } from "@mikro-orm/migrations";

const rootEnvFile = fileURLToPath(new URL("../../../.env.local", import.meta.url));
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

// Imported after the env file is loaded, because the config reads `process.env` eagerly.
const { createOrmConfig } = await import("./config");

export default createOrmConfig({
  extensions: [Migrator],
  migrations: {
    path: fileURLToPath(new URL("./migrations", import.meta.url)),
    pathTs: fileURLToPath(new URL("./migrations", import.meta.url)),
  },
});
