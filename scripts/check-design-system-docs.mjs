import { fileURLToPath } from "node:url";

import { main } from "./check-design-system-docs/check.mjs";

// Run with `npm run check:docs`. Plain JavaScript with `node:` built-ins only.
process.exitCode = main(fileURLToPath(new URL("..", import.meta.url)));
