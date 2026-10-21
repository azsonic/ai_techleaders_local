import "server-only";

import { asClass, asValue, createContainer, InjectionMode, type AwilixContainer } from "awilix";

import { ServiceUnavailableError } from "@devmentor/core";
import { getOrm, HealthRepository, type EntityManager, type MikroORM } from "@devmentor/db";

import { HealthService } from "@/modules/health/health.service";

export interface Cradle {
  // singleton
  orm: MikroORM;
  // scoped — registered per request in `createRequestScope()`
  em: EntityManager;
  healthRepository: HealthRepository;
  healthService: HealthService;
}

let rootContainer: Promise<AwilixContainer<Cradle>> | undefined;

async function buildRootContainer(): Promise<AwilixContainer<Cradle>> {
  const orm = await getOrm();

  // PROXY mode resolves dependencies by property name, so it survives minification (CLASSIC does not).
  const container = createContainer<Cradle>({ injectionMode: InjectionMode.PROXY, strict: true });

  container.register({
    orm: asValue(orm),
    healthRepository: asClass(HealthRepository).scoped(),
    healthService: asClass(HealthService).scoped(),
  });

  return container;
}

function getRootContainer(): Promise<AwilixContainer<Cradle>> {
  rootContainer ??= buildRootContainer().catch((error: unknown) => {
    rootContainer = undefined;
    throw new ServiceUnavailableError("database_unavailable", "Database is unavailable", { cause: error });
  });
  return rootContainer;
}

/**
 * Creates the DI scope for one request, server action or job. Always dispose it when done.
 */
export async function createRequestScope(): Promise<AwilixContainer<Cradle>> {
  const container = await getRootContainer();
  const scope = container.createScope();
  scope.register({ em: asValue(container.cradle.orm.em.fork()) });
  return scope;
}

/**
 * Runs `fn` inside a fresh request scope and always disposes the scope afterwards.
 */
export async function withRequestScope<T>(fn: (cradle: Cradle) => Promise<T>): Promise<T> {
  const scope = await createRequestScope();
  try {
    return await fn(scope.cradle);
  } finally {
    await scope.dispose();
  }
}
