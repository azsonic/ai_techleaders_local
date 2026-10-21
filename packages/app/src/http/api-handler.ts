import "server-only";

import { unstable_rethrow } from "next/navigation";

import { createApiHandler } from "@devmentor/core";

/** Wrap every route handler in this. See `createApiHandler` in `@devmentor/core`. */
export const apiHandler = createApiHandler({ rethrow: unstable_rethrow });
