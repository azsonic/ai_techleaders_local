import { runAlways } from "../run-steps.mjs";

export const migrateDatabaseStep = {
  title: "Apply database migrations",
  // `db:migrate` (MikroORM `migration:up`) skips migrations that are already applied, so it is
  // safe on every run.
  check: runAlways,
  run: async ({ root, exec }) => {
    await exec("npm", ["run", "db:migrate"], { cwd: root });
    return "schema up to date";
  },
};
