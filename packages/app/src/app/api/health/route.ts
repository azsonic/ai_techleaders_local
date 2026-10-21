import { connection } from "next/server";

import { withRequestScope } from "@/di/container";
import { apiHandler } from "@/http/api-handler";

export const GET = apiHandler(async () => {
  await connection();
  return withRequestScope(({ healthService }) => healthService.check());
});
