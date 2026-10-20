import type { HealthRepository } from "@devmentor/db";

export type HealthStatus =
  | { status: "ok"; db: "ok" }
  | { status: "error"; db: "unavailable" };

export class HealthService {
  readonly #healthRepository: HealthRepository;

  constructor({ healthRepository }: { healthRepository: HealthRepository }) {
    this.#healthRepository = healthRepository;
  }

  async check(): Promise<HealthStatus> {
    try {
      await this.#healthRepository.ping();
      return { status: "ok", db: "ok" };
    } catch (error) {
      console.error("Health check: database ping failed", error);
      return { status: "error", db: "unavailable" };
    }
  }
}
