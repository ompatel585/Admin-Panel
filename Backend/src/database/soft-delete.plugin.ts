import type {
  Aggregate,
  MongooseQueryMiddleware,
  Query,
  Schema,
} from 'mongoose';

/**
 * Soft delete. A document is deleted when `deletedAt` holds a time; live
 * documents have `deletedAt: null` (or no field at all, e.g. rows written
 * before this existed: Mongo matches `{ deletedAt: null }` on both).
 *
 * The plugin hides deleted documents from every query and aggregate on the
 * model, including populate, so no caller can leak one by forgetting a filter.
 * To read them on purpose, pass `{ withDeleted: true }` in the query options
 * (`Model.find().setOptions({ withDeleted: true })`) or name `deletedAt` in the
 * filter yourself.
 */
export const SOFT_DELETE_FIELD = 'deletedAt';

interface SoftDeleteOptions {
  withDeleted?: boolean;
}

/** The slice of a Mongoose query the filter needs; lets the logic be tested without a database. */
export interface FilterableQuery {
  getFilter(): Record<string, unknown>;
  getOptions(): SoftDeleteOptions;
  where(conditions: Record<string, unknown>): unknown;
}

/** Every read or write that takes a filter. Hard-delete operations are deliberately absent: nothing should be using them. */
const QUERY_OPERATIONS: MongooseQueryMiddleware[] = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndReplace',
  'findOneAndDelete',
  'updateOne',
  'updateMany',
  'countDocuments',
  'distinct',
];

/** Restricts a query to live documents unless it opted out or already named `deletedAt`. */
export function excludeSoftDeleted(query: FilterableQuery): void {
  if (query.getOptions().withDeleted) return;
  if (SOFT_DELETE_FIELD in query.getFilter()) return;
  query.where({ [SOFT_DELETE_FIELD]: null });
}

/** Same for an aggregation: a leading `$match` so the rest of the pipeline never sees deleted rows. */
export function excludeSoftDeletedFromPipeline(
  pipeline: Record<string, unknown>[],
  options: SoftDeleteOptions,
): void {
  if (options.withDeleted) return;
  pipeline.unshift({ $match: { [SOFT_DELETE_FIELD]: null } });
}

export function softDeletePlugin(schema: Schema): void {
  schema.add({ [SOFT_DELETE_FIELD]: { type: Date, default: null } });

  schema.pre<Query<unknown, unknown>>(QUERY_OPERATIONS, function () {
    excludeSoftDeleted(this as unknown as FilterableQuery);
  });

  schema.pre<Aggregate<unknown>>('aggregate', function () {
    excludeSoftDeletedFromPipeline(
      this.pipeline() as unknown as Record<string, unknown>[],
      this.options as SoftDeleteOptions,
    );
  });
}
