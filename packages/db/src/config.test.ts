import { afterEach, describe, expect, it } from "vitest";

import { createOrmConfig } from "./config";
import { entities } from "./entities";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

function config() {
  return createOrmConfig() as {
    clientUrl: string;
    pool: { min: number; max: number };
    discovery: { warnWhenNoEntities: boolean };
    debug: boolean;
  };
}

describe("createOrmConfig", () => {
  it("throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;

    expect(() => createOrmConfig()).toThrow(/DATABASE_URL is not set/);
  });

  it("reads the connection, pool size, and empty entity list", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
    delete process.env.DATABASE_POOL_MAX;
    process.env.NODE_ENV = "test";

    expect(entities).toEqual([]);
    expect(config()).toMatchObject({
      clientUrl: "postgresql://user:pass@localhost:5432/devmentor",
      pool: { min: 0, max: 10 },
      discovery: { warnWhenNoEntities: false },
      debug: false,
    });
  });

  it("uses DATABASE_POOL_MAX when it is set", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
    process.env.DATABASE_POOL_MAX = "4";

    expect(config().pool.max).toBe(4);
  });

  it("enables debug only in development when DATABASE_DEBUG is true", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";

    process.env.NODE_ENV = "development";
    process.env.DATABASE_DEBUG = "true";
    expect(config().debug).toBe(true);

    process.env.DATABASE_DEBUG = "false";
    expect(config().debug).toBe(false);

    delete process.env.DATABASE_DEBUG;
    expect(config().debug).toBe(false);

    process.env.NODE_ENV = "production";
    process.env.DATABASE_DEBUG = "true";
    expect(config().debug).toBe(false);
  });

  it("lets callers override the config", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/devmentor";
    process.env.NODE_ENV = "production";

    const overridden = createOrmConfig({ debug: true, pool: { min: 2, max: 3 } }) as {
      debug: boolean;
      pool: { min: number; max: number };
    };

    expect(overridden.debug).toBe(true);
    expect(overridden.pool).toMatchObject({ min: 2, max: 3 });
  });
});
