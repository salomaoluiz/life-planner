import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@domain/entities/financial/Currency";
import {
  ACCOUNT_ICONS,
  DEFAULT_ICON_BY_TYPE,
} from "@presentation/constants/accountIcons";
import { iconLabel } from "@presentation/constants/categoryIcons";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  ACCOUNT_TYPE_LABEL_KEYS,
  ACCOUNT_TYPE_ORDER,
} from "@screens/Financial/Accounts/models/accountList";
import {
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

interface Params {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

class NewAccountUIModel {
  // Spec 103: the three supported currencies, labelled `BRL · Real`.
  get currencyOptions(): { labelKey: TranslationKeys; value: CurrencyCode }[] {
    return SUPPORTED_CURRENCIES.map((code) => ({
      labelKey: `financial.accounts.currencyOption.${code}` as TranslationKeys,
      value: code,
    }));
  }

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

  // Spec 101: the five types in list order, each with the icon it suggests.
  get typeOptions(): {
    icon: string;
    labelKey: TranslationKeys;
    value: AccountType;
  }[] {
    return ACCOUNT_TYPE_ORDER.map((type) => ({
      icon: DEFAULT_ICON_BY_TYPE[type],
      labelKey: ACCOUNT_TYPE_LABEL_KEYS[type],
      value: type,
    }));
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

  // Spec 094 FR 14: the name of the favorite that turning the switch on would replace.
  replacedFavoriteName(accountId: string | undefined): string | undefined {
    const favorite = this.params.accounts.find((account) => account.isFavorite);

    return favorite && favorite.id !== accountId ? favorite.name : undefined;
  }

  typeHintKey(type: AccountType): TranslationKeys {
    return `financial.accounts.form.typeHints.${type}`;
  }
}

export default NewAccountUIModel;
