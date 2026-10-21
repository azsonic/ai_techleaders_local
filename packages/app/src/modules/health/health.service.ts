import { ServiceUnavailableError } from "@devmentor/core";
import type { HealthRepository } from "@devmentor/db";

export interface HealthStatus {
  status: "ok";
  db: "ok";
}

export class HealthService {
  readonly #healthRepository: HealthRepository;

  constructor({ healthRepository }: { healthRepository: HealthRepository }) {
    this.#healthRepository = healthRepository;
  }

  async check(): Promise<HealthStatus> {
    try {
      await this.#healthRepository.ping();
    } catch (error) {
      throw new ServiceUnavailableError("database_unavailable", "Database is unavailable", { cause: error });
    }
    return { status: "ok", db: "ok" };
  }
}
