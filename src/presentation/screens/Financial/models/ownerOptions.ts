import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export const ALL_OWNERS = "ALL";
// Marker of an archived family in the owner filters (spec 042).
const ARCHIVED_ICON = "archive-outline";

export interface ChoiceOption {
  // An archived family: listed last in the filters with an archive marker, never offered when creating (spec 042).
  archived?: boolean;
  label?: string;
  labelKey?: TranslationKeys;
  value: string;
}

function activeOwnerIds(owners: OwnerDTO[]): string[] {
  return activeOwners(owners).map((owner) => owner.id);
}

function activeOwners(owners: OwnerDTO[]): OwnerDTO[] {
  return owners.filter((owner) => !owner.archived);
}

function archivedOwnerIds(owners: OwnerDTO[]): Set<string> {
  return new Set(
    owners.filter((owner) => owner.archived).map((owner) => owner.id),
  );
}

// "Personal" first, then the active families by name (creation pickers). Values are owner ids.
function buildOwnerChoices(owners: OwnerDTO[]): ChoiceOption[] {
  const personal = owners.find((owner) => owner.type === OwnerType.USER);
  const families = sortedFamilies(activeOwners(owners));

  return [
    ...(personal
      ? [{ labelKey: "financial.common.personal", value: personal.id } as const]
      : []),
    ...families.map((family) => ({ label: family.name, value: family.id })),
  ];
}

// All, Personal, the active families, then the archived ones with the marker (spec 042 FR 7).
function buildOwnerFilterChoices(owners: OwnerDTO[]): ChoiceOption[] {
  return [
    { labelKey: "financial.common.all", value: ALL_OWNERS },
    ...buildOwnerChoices(owners),
    ...sortedFamilies(owners.filter((owner) => owner.archived)).map(
      (family) => ({ archived: true, label: family.name, value: family.id }),
    ),
  ];
}

function isArchivedOwner(owners: OwnerDTO[], ownerId: string): boolean {
  return owners.some((owner) => owner.id === ownerId && owner.archived);
}

function personalOwnerId(owners: OwnerDTO[]): string | undefined {
  return owners.find((owner) => owner.type === OwnerType.USER)?.id;
}

function sortedFamilies(owners: OwnerDTO[]): OwnerDTO[] {
  return owners
    .filter((owner) => owner.type === OwnerType.FAMILY)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function translateChoices(
  choices: ChoiceOption[],
  t: (key: TranslationKeys) => string,
) {
  return choices.map((choice) => ({
    icon: choice.archived ? ARCHIVED_ICON : undefined,
    label: choice.labelKey ? t(choice.labelKey) : (choice.label ?? ""),
    value: choice.value,
  }));
}

export {
  activeOwnerIds,
  activeOwners,
  archivedOwnerIds,
  buildOwnerChoices,
  buildOwnerFilterChoices,
  isArchivedOwner,
  personalOwnerId,
  translateChoices,
};
