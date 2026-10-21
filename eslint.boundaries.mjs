// Package dependency rules from AGENTS.md, enforced with `no-restricted-imports`. Each package's eslint config
// calls `importBoundaries()` once; a second `no-restricted-imports` entry would replace this one, not merge with it.

const crossPackageDeepImports = [
  {
    regex: "^(\\.\\./)+(app|core|db|ui)/src(/|$)",
    message: "Import other packages through their public entry (@devmentor/<pkg>), never by relative path.",
  },
  {
    regex: "^@devmentor/[^/]+/src(/|$)",
    message: "Import other packages through the entries declared in their package.json `exports`.",
  },
];

export const forbidden = {
  react: { group: ["react", "react/*", "react-dom", "react-dom/*"], message: "This package must not depend on React." },
  next: { group: ["next", "next/*"], message: "This package must not depend on Next.js." },
  orm: { group: ["@mikro-orm/*"], message: "Only @devmentor/db may import MikroORM." },
  di: { group: ["awilix"], message: "The DI container is composed only in @devmentor/app." },
  app: { group: ["@devmentor/app", "@devmentor/app/*"], message: "Nothing depends on @devmentor/app." },
  db: { group: ["@devmentor/db", "@devmentor/db/*"], message: "This package must not depend on @devmentor/db." },
  ui: { group: ["@devmentor/ui", "@devmentor/ui/*"], message: "This package must not depend on @devmentor/ui." },
  workspace: { group: ["@devmentor/*"], message: "@devmentor/core must not depend on other workspace packages." },
};

/** @param {Array<{ group: string[]; message: string }>} rules */
export function importBoundaries(rules = []) {
  return {
    rules: {
      "no-restricted-imports": ["error", { patterns: [...crossPackageDeepImports, ...rules] }],
    },
  };
}

const API_PATH = "/^\\/api(\\/|$)/";
const RAW_API_FETCH_MESSAGE = "Call /api/* through apiCall/apiCallOrThrow from @devmentor/ui/backend/api/api-call.";

/** Forbids `fetch("/api…")` and fetch(`/api…`); `apiCall` is the only sanctioned caller. */
export const noRawApiFetch = {
  rules: {
    "no-restricted-syntax": [
      "error",
      { selector: `CallExpression[callee.name='fetch'][arguments.0.value=${API_PATH}]`, message: RAW_API_FETCH_MESSAGE },
      {
        selector: `CallExpression[callee.name='fetch'][arguments.0.quasis.0.value.raw=${API_PATH}]`,
        message: RAW_API_FETCH_MESSAGE,
      },
    ],
  },
};
