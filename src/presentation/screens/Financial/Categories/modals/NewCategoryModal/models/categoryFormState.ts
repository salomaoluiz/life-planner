import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateCategoryUseCaseParams } from "@application/useCases/cases/financial/categories/createCategoryUseCase";
import { UpdateCategoryUseCaseParams } from "@application/useCases/cases/financial/categories/updateCategoryUseCase";
import {
  DEFAULT_CATEGORY_COLOR,
  normalizeCategoryColor,
} from "@presentation/constants/categoryColors";
import { TranslationKeys } from "@presentation/i18n/types";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

const MAX_NAME = 60;

type CategoryFormErrors = Partial<Record<"name", TranslationKeys>>;

interface CategoryFormState {
  icon: string;
  iconColor: string;
  name: string;
  ownerId: string;
  parentId?: string;
  type: string;
}

function changeOwner(
  state: CategoryFormState,
  ownerId: string,
): CategoryFormState {
  return { ...state, ownerId, parentId: undefined };
}

function changeType(
  state: CategoryFormState,
  type: string,
  categories: CategoryDTO[],
): CategoryFormState {
  const parent = categories.find((category) => category.id === state.parentId);

  return {
    ...state,
    parentId: parent && parent.type === type ? state.parentId : undefined,
    type,
  };
}

function createInitialState(params: {
  ownerId: string;
  type?: string;
}): CategoryFormState {
  return {
    icon: "folder",
    iconColor: DEFAULT_CATEGORY_COLOR,
    name: "",
    ownerId: params.ownerId,
    parentId: undefined,
    type: params.type ?? "EXPENSE",
  };
}

function isSameState(a: CategoryFormState, b: CategoryFormState) {
  return (
    a.iconColor.toLowerCase() === b.iconColor.toLowerCase() &&
    a.icon === b.icon &&
    a.name === b.name &&
    a.ownerId === b.ownerId &&
    a.parentId === b.parentId &&
    a.type === b.type
  );
}

function stateFromDto(dto: CategoryDTO): CategoryFormState {
  return {
    icon: dto.icon,
    iconColor: normalizeCategoryColor(dto.iconColor),
    name: dto.name,
    // An All category has no single owner: the form shows the "All" choice.
    ownerId: dto.scope === "ALL" ? ALL_OWNERS : dto.ownerId,
    parentId: dto.parentId,
    type: dto.type,
  };
}

function toCreateParams(
  state: CategoryFormState,
  owner: OwnerDTO,
  categories: CategoryDTO[],
): CreateCategoryUseCaseParams {
  const parent = categories.find((category) => category.id === state.parentId);
  const isAll = state.ownerId === ALL_OWNERS;

  return {
    depthLevel: parent ? (parent.depthLevel ?? 0) + 1 : 0,
    icon: state.icon,
    iconColor: state.iconColor,
    name: state.name.trim(),
    owner: isAll ? ALL_OWNERS : owner.type,
    ownerId: isAll ? undefined : owner.id,
    parentId: state.parentId,
    type: state.type,
  };
}

// Only changed fields travel; owner/ownerId are immutable (the API answers 400 otherwise). The one exception is
// switching a single-scope category to All, sent as `scope`.
function toUpdateParams(
  id: string,
  state: CategoryFormState,
  initial: CategoryFormState,
): UpdateCategoryUseCaseParams {
  const params: UpdateCategoryUseCaseParams = { id };

  if (state.name.trim() !== initial.name.trim()) {
    params.name = state.name.trim();
  }
  if (state.icon !== initial.icon) {
    params.icon = state.icon;
  }
  if (state.iconColor.toLowerCase() !== initial.iconColor.toLowerCase()) {
    params.iconColor = state.iconColor;
  }
  if (state.type !== initial.type) {
    params.type = state.type;
  }
  if (state.parentId !== initial.parentId) {
    params.parentId = state.parentId ?? null;
  }
  if (state.ownerId === ALL_OWNERS && initial.ownerId !== ALL_OWNERS) {
    params.scope = "ALL";
  }

  return params;
}

function validate(state: CategoryFormState): CategoryFormErrors {
  const name = state.name.trim();

  if (!name) {
    return { name: "financial.categories.nameRequired" };
  }
  if (name.length > MAX_NAME) {
    return { name: "financial.categories.form.errors.nameTooLong" };
  }

  return {};
}

export type { CategoryFormErrors, CategoryFormState };
export {
  changeOwner,
  changeType,
  createInitialState,
  isSameState,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
};
