import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export const ALL_OWNERS = "ALL";

export interface ChoiceOption {
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

// "Personal" first, then the families by name. Values are owner ids.
function buildOwnerChoices(owners: OwnerDTO[]): ChoiceOption[] {
  const personal = owners.find((owner) => owner.type === OwnerType.USER);
  const families = owners
    .filter((owner) => owner.type === OwnerType.FAMILY)
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    ...(personal
      ? [{ labelKey: "financial.common.personal", value: personal.id } as const]
      : []),
    ...families.map((family) => ({ label: family.name, value: family.id })),
  ];
}

function buildOwnerFilterChoices(owners: OwnerDTO[]): ChoiceOption[] {
  return [
    { labelKey: "financial.common.all", value: ALL_OWNERS },
    ...buildOwnerChoices(owners),
  ];
}

function personalOwnerId(owners: OwnerDTO[]): string | undefined {
  return owners.find((owner) => owner.type === OwnerType.USER)?.id;
}

function translateChoices(
  choices: ChoiceOption[],
  t: (key: TranslationKeys) => string,
) {
  return choices.map((choice) => ({
    label: choice.labelKey ? t(choice.labelKey) : (choice.label ?? ""),
    value: choice.value,
  }));
}

export {
  buildOwnerChoices,
  buildOwnerFilterChoices,
  personalOwnerId,
  translateChoices,
};
