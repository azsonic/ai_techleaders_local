import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const appSrc = fileURLToPath(new URL("./packages/app/src/", import.meta.url));
const serverOnly = fileURLToPath(new URL("./vitest/server-only.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)/, replacement: `${appSrc}$1` },
      { find: "server-only", replacement: serverOnly },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx", "scripts/**/*.test.mjs"],
    exclude: ["packages/app/test/**", "node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      include: [
        "packages/app/src/**/*.{ts,tsx}",
        "packages/core/src/**/*.{ts,tsx}",
        "packages/db/src/**/*.{ts,tsx}",
        "packages/ui/src/**/*.{ts,tsx}",
        "packages/app/next.config.ts",
        "scripts/**/*.mjs",
      ],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.test.mjs"],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
