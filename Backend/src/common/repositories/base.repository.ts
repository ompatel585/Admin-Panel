import type {
  HydratedDocument,
  Model,
  PopulateOptions,
  QueryFilter,
  Types,
  UpdateQuery,
} from 'mongoose';
import type { PaginatedResult } from '../types/api-response.type.js';

export interface FindPageOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions | PopulateOptions[];
}

/**
 * Generic data-access layer. Feature repositories extend it and add only the
 * queries specific to their collection; services never touch a Mongoose
 * model directly.
 */
export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data) as Promise<HydratedDocument<T>>;
  }

  findById(
    id: string | Types.ObjectId,
    populate?: PopulateOptions | PopulateOptions[],
  ) {
    const query = this.model.findById(id);
    return populate ? query.populate(populate) : query;
  }

  findOne(filter: QueryFilter<T>) {
    return this.model.findOne(filter);
  }

  find(filter: QueryFilter<T> = {}) {
    return this.model.find(filter);
  }

  async findPage(
    filter: QueryFilter<T>,
    { page, limit, sort = { createdAt: -1 }, populate }: FindPageOptions,
  ): Promise<PaginatedResult<HydratedDocument<T>>> {
    let query = this.model
      .find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    if (populate) query = query.populate(populate);

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      items: items as unknown as HydratedDocument<T>[],
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    populate?: PopulateOptions | PopulateOptions[],
  ) {
    const query = this.model.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
      runValidators: true,
    });
    return populate ? query.populate(populate) : query;
  }

  deleteById(id: string | Types.ObjectId) {
    return this.model.findByIdAndDelete(id);
  }

  count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    return (await this.model.exists(filter)) !== null;
  }
}
