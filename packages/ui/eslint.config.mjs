import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { forbidden, importBoundaries, noRawApiFetch } from "../../eslint.boundaries.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  importBoundaries([forbidden.orm, forbidden.di, forbidden.db, forbidden.app]),
  { ...noRawApiFetch, ignores: ["src/backend/api/api-call.ts"] },
]);
