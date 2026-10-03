import type { Schema } from 'mongoose';

/** Shared serialisation: `_id` -> `id`, no `__v`. */
export function applyBaseSchemaOptions<T extends Schema>(schema: T): T {
  schema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      return ret;
    },
  });
  return schema;
}
