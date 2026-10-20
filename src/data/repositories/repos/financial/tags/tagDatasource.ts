import TagModel from "@data/models/financial/TagModel";
import { OwnerType } from "@data/models/financial/TransactionModel";

export interface TagDatasource {
  createTag(params: CreateTagDatasourceParams): Promise<TagModel>;
  deleteTag(id: string): Promise<void>;
  getTags(ownerIds: string[]): Promise<TagModel[]>;
  updateTag(params: UpdateTagDatasourceParams): Promise<void>;
}

interface CreateTagDatasourceParams {
  name: string;
  owner: TagOwner;
  ownerId?: string;
}

// "ALL": the creator's Personal scope and every family they are in; no ownerId.
type TagOwner = "ALL" | OwnerType;

interface UpdateTagDatasourceParams {
  id: string;
  name?: string;
  // Turns a single-scope tag into an All tag (no way back).
  scope?: "ALL";
}

export { CreateTagDatasourceParams, UpdateTagDatasourceParams };
