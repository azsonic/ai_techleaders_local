import { runSteps } from "./run-steps.mjs";
import { createEnvFileStep } from "./steps/create-env-file.mjs";
import { ensureDatabaseStep } from "./steps/ensure-database.mjs";
import { installDependenciesStep } from "./steps/install-dependencies.mjs";
import { migrateDatabaseStep } from "./steps/migrate-database.mjs";
import { preflightStep } from "./steps/preflight.mjs";

// Same order as README "Getting started": each step is skipped when its work is already done.
export const steps = [preflightStep, installDependenciesStep, createEnvFileStep, ensureDatabaseStep, migrateDatabaseStep];

/**
 * @param {{ root: string, system: object }} options `root` is the repo root; `system` holds the adapters.
 * @returns {Promise<number>} the process exit code
 */
export async function main({ root, system }) {
  const code = await runSteps(steps, { root, ...system });
  if (code === 0) {
    system.log("");
    system.log("Setup complete. Next: npm run dev, then open http://localhost:3000 (admin: http://localhost:3000/admin).");
  }
  return code;
}
