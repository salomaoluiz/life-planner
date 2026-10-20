import TagDTO from "@application/dto/financial/TagDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateTagUseCaseParams } from "@application/useCases/cases/financial/tags/createTagUseCase";
import { UpdateTagUseCaseParams } from "@application/useCases/cases/financial/tags/updateTagUseCase";
import { TranslationKeys } from "@presentation/i18n/types";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

const MAX_TAG_NAME = 30;

interface TagFormErrors {
  name?: TranslationKeys;
}

interface TagFormState {
  name: string;
  // An owner id, or ALL_OWNERS for a tag of every scope.
  ownerId: string;
}

function createInitialState(ownerId: string): TagFormState {
  return { name: "", ownerId };
}

function isSameState(a: TagFormState, b: TagFormState) {
  return a.name === b.name && a.ownerId === b.ownerId;
}

function stateFromDto(tag: TagDTO): TagFormState {
  return {
    name: tag.name,
    ownerId: tag.scope === "ALL" ? ALL_OWNERS : tag.ownerId,
  };
}

function toCreateParams(
  state: TagFormState,
  owner: OwnerDTO | undefined,
): CreateTagUseCaseParams {
  const isAll = state.ownerId === ALL_OWNERS;

  return {
    name: state.name.trim(),
    owner: isAll ? ALL_OWNERS : (owner?.type ?? ""),
    ownerId: isAll ? undefined : owner?.id,
  };
}

// Only changed fields travel; the one owner change allowed is single-scope -> All, sent as `scope`.
function toUpdateParams(
  id: string,
  state: TagFormState,
  initial: TagFormState,
): UpdateTagUseCaseParams {
  const params: UpdateTagUseCaseParams = { id };

  if (state.name.trim() !== initial.name.trim()) {
    params.name = state.name.trim();
  }
  if (state.ownerId === ALL_OWNERS && initial.ownerId !== ALL_OWNERS) {
    params.scope = "ALL";
  }

  return params;
}

function validate(state: TagFormState): TagFormErrors {
  const name = state.name.trim();

  if (!name) {
    return { name: "financial.tagForm.nameRequired" };
  }
  if (name.length > MAX_TAG_NAME) {
    return { name: "financial.transactions.form.tagsTooLong" };
  }

  return {};
}

export type { TagFormErrors, TagFormState };
export {
  createInitialState,
  isSameState,
  MAX_TAG_NAME,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
};
