import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { ACCOUNT_ICONS } from "@presentation/constants/accountIcons";
import { iconLabel } from "@presentation/constants/categoryIcons";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

interface Params {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

class NewAccountUIModel {
  get iconOptions(): { label: string; value: string }[] {
    return ACCOUNT_ICONS.map((name) => ({
      label: iconLabel(name),
      value: name,
    }));
  }

  get ownerChoices(): ChoiceOption[] {
    return buildOwnerChoices(this.params.owners);
  }

  get signOptions(): {
    labelKey: TranslationKeys;
    value: "NEGATIVE" | "POSITIVE";
  }[] {
    return [
      { labelKey: "financial.accounts.form.positive", value: "POSITIVE" },
      { labelKey: "financial.accounts.form.negative", value: "NEGATIVE" },
    ];
  }

  constructor(private readonly params: Params) {}

  account(id: string): AccountDTO | undefined {
    return this.params.accounts.find((account) => account.id === id);
  }

  owner(ownerId: string): OwnerDTO {
    return (
      this.params.owners.find((owner) => owner.id === ownerId) ??
      this.params.owners[0]
    );
  }
}

export default NewAccountUIModel;
