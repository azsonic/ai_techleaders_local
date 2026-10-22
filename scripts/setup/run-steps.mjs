/**
 * @typedef {object} Step
 * @property {string} title
 * @property {(ctx: object) => Promise<string | null>} check Returns a skip reason when the work is already done, otherwise null.
 * @property {(ctx: object) => Promise<string | void>} run Does the work; may return a short detail for the status line.
 */

/** A `check` for steps that are cheap and safe to repeat on every run. */
export const runAlways = async () => null;

/**
 * Runs the steps in order and prints one status line per step.
 * Stops at the first failure.
 *
 * @param {Step[]} steps
 * @param {{ log: (line: string) => void }} ctx
 * @returns {Promise<number>} the process exit code
 */
export async function runSteps(steps, ctx) {
  for (const step of steps) {
    try {
      const skipReason = await step.check(ctx);
      if (skipReason) {
        ctx.log(`${"[skipped]".padEnd(10)}${step.title} (${skipReason})`);
        continue;
      }
      const detail = await step.run(ctx);
      ctx.log(`${"[done]".padEnd(10)}${step.title}${detail ? ` (${detail})` : ""}`);
    } catch (error) {
      ctx.log(`${"[failed]".padEnd(10)}${step.title}`);
      ctx.log(`${" ".repeat(10)}${error?.message ?? String(error)}`);
      return 1;
    }
  }
  return 0;
}
