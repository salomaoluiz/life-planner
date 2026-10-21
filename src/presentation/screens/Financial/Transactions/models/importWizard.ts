import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  ALL_OWNERS,
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

export type ImportStep = "columns" | "file" | "review" | "values";

export const IMPORT_STEPS: ImportStep[] = [
  "file",
  "columns",
  "values",
  "review",
];

// FR 12: the scope selected on the Transactions screen when it is Personal or an active family; otherwise Personal.
function defaultImportOwner(owners: OwnerDTO[], screenOwner: string): string {
  const personal = owners.find((owner) => owner.type === OwnerType.USER)?.id;
  const chosen = owners.find(
    (owner) => owner.id === screenOwner && !owner.archived,
  );

  return screenOwner !== ALL_OWNERS && chosen ? chosen.id : (personal ?? "");
}

// FR 12: Personal and each active family; archived families are not offered.
function importOwnerChoices(owners: OwnerDTO[]): ChoiceOption[] {
  return buildOwnerChoices(owners);
}

function nextStep(step: ImportStep): ImportStep {
  return IMPORT_STEPS[Math.min(IMPORT_STEPS.indexOf(step) + 1, 3)];
}

function previousStep(step: ImportStep): ImportStep {
  return IMPORT_STEPS[Math.max(IMPORT_STEPS.indexOf(step) - 1, 0)];
}

export { defaultImportOwner, importOwnerChoices, nextStep, previousStep };
