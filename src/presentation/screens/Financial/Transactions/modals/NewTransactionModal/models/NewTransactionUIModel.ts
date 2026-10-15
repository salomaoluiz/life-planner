import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  buildCategoryRows,
  categoriesOf,
} from "@screens/Financial/models/categoryTree";
import { buildOwnerChoices } from "@screens/Financial/models/ownerOptions";

interface AccountOption {
  descriptionKey?: TranslationKeys;
  label: string;
  value: string;
}

interface Props {
  accounts: AccountDTO[];
  cards?: CreditCardDTO[];
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

  // Archived accounts are not offered for new records; the one already selected stays so an old
  // transaction can still be edited (and shows where it lives).
  accountOptions(ownerId: string, selectedAccountId?: string): AccountOption[] {
    const accounts = this.accountsOf(ownerId);
    const active = accounts
      .filter((account) => account.status !== "ARCHIVED")
      .sort(byName);
    const selectedArchived = accounts.find(
      (account) =>
        account.status === "ARCHIVED" && account.id === selectedAccountId,
    );

    return [
      ...active.map((account) => ({ label: account.name, value: account.id })),
      ...(selectedArchived
        ? [
            {
              descriptionKey:
                "financial.accounts.archivedLabel" as TranslationKeys,
              label: selectedArchived.name,
              value: selectedArchived.id,
            },
          ]
        : []),
    ];
  }

  card(cardId?: string) {
    return (this.props.cards ?? []).find((card) => card.id === cardId);
  }

  // Archived cards are not offered for new purchases; the selected one stays so an old purchase can be edited.
  cardOptions(ownerId: string, selectedCardId?: string): AccountOption[] {
    const cards = this.cardsOf(ownerId);
    const active = cards
      .filter((card) => card.status !== "ARCHIVED")
      .sort((a, b) => a.title.localeCompare(b.title));
    const selectedArchived = cards.find(
      (card) => card.status === "ARCHIVED" && card.id === selectedCardId,
    );

    return [...active, ...(selectedArchived ? [selectedArchived] : [])].map(
      (card) => ({
        descriptionKey:
          card.status === "ARCHIVED"
            ? ("financial.accounts.archivedLabel" as TranslationKeys)
            : undefined,
        label: card.lastDigits
          ? `${card.title} ••${card.lastDigits}`
          : card.title,
        value: card.id,
      }),
    );
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
    return this.accountsOf(ownerId).some(
      (account) => account.status !== "ARCHIVED",
    );
  }

  hasCards(ownerId: string) {
    return this.cardsOf(ownerId).some((card) => card.status !== "ARCHIVED");
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

  private cardsOf(ownerId: string) {
    return (this.props.cards ?? []).filter((card) => card.ownerId === ownerId);
  }
}

function byName(a: AccountDTO, b: AccountDTO) {
  return a.name.localeCompare(b.name);
}

export default NewTransactionUIModel;
