import { execFile } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const agentBrowser = require.resolve("agent-browser/bin/agent-browser.js");

export function browser(session: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [agentBrowser, "--session", session, "--json", ...args],
      {
        timeout: 60_000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, AGENT_BROWSER_DEFAULT_TIMEOUT: "30000" },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`agent-browser ${args.join(" ")} failed\n${stderr}\n${stdout}`));
          return;
        }
        resolve(stdout);
      },
    );
  });
}
