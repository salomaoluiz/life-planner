import TagEntity, { TagOwner } from "@domain/entities/financial/TagEntity";

export type FinancialTagRepository = {
  createTag(params: CreateTagRepositoryParams): Promise<TagEntity>;
  deleteTag(id: string): Promise<void>;
  getTags(ownerIds: string[]): Promise<TagEntity[]>;
  updateTag(params: UpdateTagRepositoryParams): Promise<void>;
};

interface CreateTagRepositoryParams {
  name: string;
  owner: TagOwner;
  ownerId?: string;
}

interface UpdateTagRepositoryParams {
  id: string;
  name?: string;
  // Turns a single-scope tag into an All tag (no way back).
  scope?: "ALL";
}

export { CreateTagRepositoryParams, UpdateTagRepositoryParams };
