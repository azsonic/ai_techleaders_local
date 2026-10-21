import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/app/test/integration/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 300_000,
    hookTimeout: 300_000,
  },
});
