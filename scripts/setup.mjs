import { fileURLToPath } from "node:url";

import { main } from "./setup/main.mjs";
import { createSystem } from "./setup/system.mjs";

// Run with `npm run setup`. Plain JavaScript with `node:` built-ins only, because it runs
// before `npm install` has put any dependency on disk.
process.exitCode = await main({ root: fileURLToPath(new URL("..", import.meta.url)), system: createSystem() });
