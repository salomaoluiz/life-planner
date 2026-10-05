import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";

const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: "Expense",
  [TransactionType.INCOME]: "Income",
};

interface INewTransactionViewModel {
  accountsDTO: AccountDTO[];
  categoriesDTO: CategoryDTO[];
  ownersDTO: OwnerDTO[];
}

class NewTransactionViewModel {
  get stockOwners() {
    return this.ownerDTOs.map((owner) => ({
      label: `${owner.type.toUpperCase()} - ${owner.name}`,
      value: owner.id,
    }));
  }

  get transactionTypes() {
    const types: Array<{ label: string; value: TransactionType }> = [];

    for (const key in TransactionTypeLabels) {
      types.push({
        label: TransactionType[key as TransactionType],
        value: key as TransactionType,
      });
    }

    return types;
  }

  private accountsDTOs: AccountDTO[];

  private categoriesDTOs: CategoryDTO[];

  private ownerDTOs: OwnerDTO[];
  constructor(props: INewTransactionViewModel) {
    this.ownerDTOs = props.ownersDTO;
    this.categoriesDTOs = props.categoriesDTO;
    this.accountsDTOs = props.accountsDTO;
  }
  accountsForOwner(ownerId: string) {
    return this.accountsDTOs
      .filter((account) => account.ownerId === ownerId)
      .map((account) => ({
        label: account.name,
        value: account.id,
      }));
  }

  categoriesForOwner(ownerId: string, type?: string) {
    return this.categoriesDTOs
      .filter(
        (category) =>
          category.ownerId === ownerId && (!type || category.type === type),
      )
      .map((category) => ({
        label: category.name,
        value: category.id,
      }));
  }

  ownerType(ownerId: string) {
    return this.ownerDTOs.find((owner) => owner.id === ownerId)!.type;
  }
}

export default NewTransactionViewModel;
