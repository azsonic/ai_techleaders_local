import { defineConfig } from "eslint/config";
import nextTs from "eslint-config-next/typescript";

import { forbidden, importBoundaries } from "../../eslint.boundaries.mjs";

export default defineConfig([
  ...nextTs,
  importBoundaries([forbidden.react, forbidden.next, forbidden.orm, forbidden.di, forbidden.workspace]),
]);
