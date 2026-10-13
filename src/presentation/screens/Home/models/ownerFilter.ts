import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export const ALL_FILTER = "ALL";
export const PERSONAL_FILTER = "PERSONAL";

export interface OwnerFilterOption {
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

export function buildOwnerFilterOptions(
  owners: OwnerDTO[],
): OwnerFilterOption[] {
  return [
    { labelKey: "home.filter.all", value: ALL_FILTER },
    { labelKey: "home.filter.personal", value: PERSONAL_FILTER },
    ...owners
      .filter((owner) => owner.type === OwnerType.FAMILY)
      .map((owner) => ({ label: owner.name, value: owner.id })),
  ];
}

export function normalizeSelection(
  owners: OwnerDTO[],
  selection: string,
): string {
  if (selection === ALL_FILTER || selection === PERSONAL_FILTER) {
    return selection;
  }

  const isOwner = owners.some(
    (owner) => owner.type === OwnerType.FAMILY && owner.id === selection,
  );

  return isOwner ? selection : ALL_FILTER;
}

export function resolveOwnerIds(
  owners: OwnerDTO[],
  selection: string,
): string[] {
  if (selection === ALL_FILTER) {
    return owners.map((owner) => owner.id);
  }

  if (selection === PERSONAL_FILTER) {
    return owners
      .filter((owner) => owner.type === OwnerType.USER)
      .map((owner) => owner.id);
  }

  return owners
    .filter((owner) => owner.id === selection)
    .map((owner) => owner.id);
}
