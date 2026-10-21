import type { EntityManager } from "@mikro-orm/postgresql";

export class HealthRepository {
  readonly #em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.#em = em;
  }

  async ping(): Promise<void> {
    await this.#em.execute("select 1");
  }
}
