import {
  excludeSoftDeleted,
  excludeSoftDeletedFromPipeline,
  type FilterableQuery,
} from './soft-delete.plugin.js';

const query = (
  filter: Record<string, unknown>,
  options: { withDeleted?: boolean } = {},
) => {
  const added: Record<string, unknown>[] = [];
  const fake: FilterableQuery = {
    getFilter: () => filter,
    getOptions: () => options,
    where: (conditions) => {
      added.push(conditions);
      return fake;
    },
  };
  return { fake, added };
};

describe('soft delete', () => {
  it('restricts a query to documents whose deletedAt is null or missing', () => {
    const { fake, added } = query({ email: 'a@b.c' });
    excludeSoftDeleted(fake);
    expect(added).toEqual([{ deletedAt: null }]);
  });

  it('leaves a query alone when it opts in to deleted documents', () => {
    const { fake, added } = query({}, { withDeleted: true });
    excludeSoftDeleted(fake);
    expect(added).toEqual([]);
  });

  it('respects a filter that already names deletedAt', () => {
    const { fake, added } = query({ deletedAt: { $ne: null } });
    excludeSoftDeleted(fake);
    expect(added).toEqual([]);
  });

  it('puts the live-only $match first in an aggregation', () => {
    const pipeline: Record<string, unknown>[] = [{ $group: { _id: '$tenant' } }];
    excludeSoftDeletedFromPipeline(pipeline, {});
    expect(pipeline[0]).toEqual({ $match: { deletedAt: null } });
    expect(pipeline).toHaveLength(2);
  });

  it('does not touch an aggregation that opts in to deleted documents', () => {
    const pipeline: Record<string, unknown>[] = [{ $group: { _id: '$tenant' } }];
    excludeSoftDeletedFromPipeline(pipeline, { withDeleted: true });
    expect(pipeline).toHaveLength(1);
  });
});
