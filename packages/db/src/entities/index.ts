import type { EntitySchema } from "@mikro-orm/postgresql";

// Register every entity schema (created with `defineEntity`) here; discovery is explicit, not folder-based.
export const entities: EntitySchema[] = [];
