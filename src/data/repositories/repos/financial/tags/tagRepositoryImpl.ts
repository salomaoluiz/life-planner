import { Datasources } from "@data/datasource";
import TagModel from "@data/models/financial/TagModel";
import TagEntity from "@domain/entities/financial/TagEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialTagRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

function tagRepositoryImpl(datasources: Datasources): FinancialTagRepository {
  function datasource() {
    return datasources.financialTagDatasource;
  }

  return {
    async createTag(params): Promise<TagEntity> {
      const model = await datasource().createTag(params);

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TAG_DATA);

      return toTagEntity(model);
    },
    async deleteTag(id): Promise<void> {
      await datasource().deleteTag(id);

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TAG_DATA);
      // The links went with the tag: the cached transactions still list it.
      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
    },
    async getTags(ownerIds): Promise<TagEntity[]> {
      const cached = cache.get<Array<Record<string, unknown>> | null>(
        CacheStringKeys.CACHE_FINANCIAL_TAG_DATA,
      );
      let models: TagModel[];

      if (cached) {
        models = cached.map((tag) => TagModel.fromJSON(tag));
      } else {
        models = await datasource().getTags(ownerIds);
        cache.set<Record<string, unknown>[]>(
          CacheStringKeys.CACHE_FINANCIAL_TAG_DATA,
          models.map((tag) => tag.toJSON()),
        );
      }

      return models.map((tag) => toTagEntity(tag));
    },
    async updateTag(params): Promise<void> {
      await datasource().updateTag(params);

      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TAG_DATA);
      // A rename shows on the cached transactions too.
      cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
    },
  };
}

function toTagEntity(model: TagModel): TagEntity {
  return new TagEntity({
    id: model.id,
    name: model.name,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    scope: model.scope,
    scopeOwnerIds: model.scopes.map((scope) => scope.ownerId),
    usageCount: model.usageCount,
  });
}

export default tagRepositoryImpl;
export { toTagEntity };
