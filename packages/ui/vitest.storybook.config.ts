import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = fileURLToPath(new URL(".", import.meta.url));

// Runs every story as a test, including its play function and the a11y check (a11y.test = "error").
// STORYBOOK_THEME=dark runs the same stories with the dark theme on the document root.
export default defineConfig({
  plugins: [storybookTest({ configDir: `${dirname}.storybook` })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
