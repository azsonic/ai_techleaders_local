import { connection } from "next/server";

import { createRequestScope } from "@/di/container";
import type { HealthStatus } from "@/modules/health/health.service";

export async function GET() {
  await connection();

  let result: HealthStatus;
  try {
    const scope = await createRequestScope();
    try {
      result = await scope.cradle.healthService.check();
    } finally {
      await scope.dispose();
    }
  } catch (error) {
    console.error("Health check: failed to initialise the database connection", error);
    result = { status: "error", db: "unavailable" };
  }

  return Response.json(result, { status: result.status === "ok" ? 200 : 503 });
}
