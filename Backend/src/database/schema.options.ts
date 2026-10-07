import type { Schema } from 'mongoose';
import { softDeletePlugin } from './soft-delete.plugin.js';

/**
 * Shared schema setup: `_id` -> `id`, no `__v`, and soft delete (`deletedAt`)
 * unless the collection holds throwaway rows (`{ softDelete: false }`).
 */
export function applyBaseSchemaOptions<T extends Schema>(
  schema: T,
  { softDelete = true }: { softDelete?: boolean } = {},
): T {
  if (softDelete) schema.plugin(softDeletePlugin);
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
