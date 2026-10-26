import { fileURLToPath } from "node:url";

import { main } from "./check-tokens/check.mjs";

// Run with `npm run check:tokens`. Plain JavaScript with `node:` built-ins only.
process.exitCode = main(fileURLToPath(new URL("..", import.meta.url)));
