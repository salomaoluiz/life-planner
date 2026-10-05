import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  buildCategoryRows,
  categoriesOf,
} from "@screens/Financial/models/categoryTree";
import { buildOwnerChoices } from "@screens/Financial/models/ownerOptions";

interface Props {
  accounts: AccountDTO[];
  categories: CategoryDTO[];
  owners: OwnerDTO[];
}

class NewTransactionUIModel {
  get ownerChoices() {
    return buildOwnerChoices(this.props.owners);
  }

  get typeOptions(): { labelKey: TranslationKeys; value: TransactionType }[] {
    return [
      { labelKey: "financial.common.expense", value: TransactionType.EXPENSE },
      { labelKey: "financial.common.income", value: TransactionType.INCOME },
    ];
  }

  constructor(private readonly props: Props) {}

  accountIds(ownerId: string) {
    return this.accountsOf(ownerId).map((account) => account.id);
  }

  accountOptions(ownerId: string) {
    const accounts = this.accountsOf(ownerId);
    const active = accounts
      .filter((account) => account.status !== "ARCHIVED")
      .sort(byName);
    const archived = accounts
      .filter((account) => account.status === "ARCHIVED")
      .sort(byName);

    return [
      ...active.map((account) => ({ label: account.name, value: account.id })),
      ...archived.map((account) => ({
        descriptionKey: "financial.accounts.archivedLabel" as TranslationKeys,
        label: account.name,
        value: account.id,
      })),
    ];
  }

  categoriesFor(ownerId: string, type: string) {
    return categoriesOf(this.props.categories, ownerId, type);
  }

  categoryIds(ownerId: string, type: string) {
    return this.categoriesFor(ownerId, type).map((category) => category.id);
  }

  categoryName(categoryId?: string) {
    return (
      this.props.categories.find((category) => category.id === categoryId)
        ?.name ?? ""
    );
  }

  categoryRows(ownerId: string, type: string) {
    return buildCategoryRows(this.categoriesFor(ownerId, type));
  }

  hasAccounts(ownerId: string) {
    return this.accountsOf(ownerId).length > 0;
  }

  hasCategories(ownerId: string, type: string) {
    return this.categoriesFor(ownerId, type).length > 0;
  }

  owner(ownerId: string) {
    return (
      this.props.owners.find((owner) => owner.id === ownerId) ??
      this.props.owners[0]
    );
  }

  private accountsOf(ownerId: string) {
    return this.props.accounts.filter((account) => account.ownerId === ownerId);
  }
}

function byName(a: AccountDTO, b: AccountDTO) {
  return a.name.localeCompare(b.name);
}

export default NewTransactionUIModel;
