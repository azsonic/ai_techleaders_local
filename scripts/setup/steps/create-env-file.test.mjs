// @vitest-environment node
import { describe, expect, it } from "vitest";

import { fakeContext, memoryFs, path } from "../test-support.mjs";
import { createEnvFileStep } from "./create-env-file.mjs";

const target = path(".env.local");
const example = path(".env.example");

describe("createEnvFileStep", () => {
  it("runs when .env.local does not exist", async () => {
    expect(await createEnvFileStep.check(fakeContext().ctx)).toBeNull();
  });

  it("skips an existing .env.local that defines DATABASE_URL", async () => {
    const fs = memoryFs({ [target]: { text: "DATABASE_URL=postgres://u:p@h/db\n" } });
    expect(await createEnvFileStep.check(fakeContext({ fs }).ctx)).toBe("already exists");
  });

  it("skips an existing .env.local but warns when DATABASE_URL is missing", async () => {
    const fs = memoryFs({ [target]: { text: "OTHER=1\n" } });
    expect(await createEnvFileStep.check(fakeContext({ fs }).ctx)).toBe(
      "already exists; warning: DATABASE_URL is missing",
    );
  });

  it("copies .env.example to .env.local", async () => {
    const files = { [example]: { text: "DATABASE_URL=x\n" } };
    const { ctx } = fakeContext({ fs: memoryFs(files) });
    expect(await createEnvFileStep.run(ctx)).toBe("copied from .env.example");
    expect(files[target].text).toBe("DATABASE_URL=x\n");
  });

  it("fails when .env.example is missing", async () => {
    await expect(createEnvFileStep.run(fakeContext().ctx)).rejects.toThrow(/\.env\.example was not found/);
  });

  it("never overwrites a file that appeared in the meantime", async () => {
    const files = { [example]: { text: "a" }, [target]: { text: "mine" } };
    await expect(createEnvFileStep.run(fakeContext({ fs: memoryFs(files) }).ctx)).rejects.toThrow(/already exists/);
    expect(files[target].text).toBe("mine");
  });
});
