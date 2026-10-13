import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CATEGORY_COLORS } from "@presentation/constants/categoryColors";
import {
  ALL_CATEGORY_ICONS,
  COMMON_CATEGORY_ICONS,
  filterIcons,
  iconLabel,
} from "@presentation/constants/categoryIcons";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  buildCategoryRows,
  categoriesOf,
  descendantIds,
} from "@screens/Financial/models/categoryTree";
import {
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

import { CategoryFormState } from "./categoryFormState";

interface Params {
  categories: CategoryDTO[];
  owners: OwnerDTO[];
  transactions: TransactionDTO[];
}

class NewCategoryUIModel {
  get colorOptions() {
    return CATEGORY_COLORS;
  }

  get ownerChoices(): ChoiceOption[] {
    return buildOwnerChoices(this.params.owners);
  }

  get typeOptions(): { labelKey: TranslationKeys; value: string }[] {
    return [
      { labelKey: "financial.common.expense", value: "EXPENSE" },
      { labelKey: "financial.common.income", value: "INCOME" },
    ];
  }

  constructor(private readonly params: Params) {}

  hasChildren(id: string): boolean {
    return this.params.categories.some((category) => category.parentId === id);
  }

  hasParent(id: string): boolean {
    return !!this.params.categories.find((category) => category.id === id)
      ?.parentId;
  }

  hasTransactions(id: string): boolean {
    return this.params.transactions.some(
      (transaction) => transaction.categoryId === id,
    );
  }

  iconOptions(query: string, all: boolean): { label: string; value: string }[] {
    const names =
      !all && !query.trim()
        ? COMMON_CATEGORY_ICONS
        : filterIcons(ALL_CATEGORY_ICONS, query);

    return names.map((name) => ({ label: iconLabel(name), value: name }));
  }

  owner(ownerId: string): OwnerDTO {
    return (
      this.params.owners.find((owner) => owner.id === ownerId) ??
      this.params.owners[0]
    );
  }

  ownerName(ownerId: string): string {
    return this.owner(ownerId).name;
  }

  // Same owner and type as the form, in tree order, without the edited category and its descendants.
  parentOptions(
    state: Pick<CategoryFormState, "ownerId" | "type">,
    editingId?: string,
  ): { depth: number; label: string; value: string }[] {
    const excluded = new Set<string>(
      editingId
        ? [editingId, ...descendantIds(this.params.categories, editingId)]
        : [],
    );

    return buildCategoryRows(
      categoriesOf(this.params.categories, state.ownerId, state.type),
    )
      .filter((row) => !excluded.has(row.category.id))
      .map((row) => ({
        depth: row.depth,
        label: row.category.name,
        value: row.category.id,
      }));
  }
}

export default NewCategoryUIModel;
