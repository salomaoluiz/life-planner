import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";

const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: "Expense",
  [TransactionType.INCOME]: "Income",
};

interface INewTransactionViewModel {
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

  private ownerDTOs: OwnerDTO[];

  constructor(props: INewTransactionViewModel) {
    this.ownerDTOs = props.ownersDTO;
  }

  ownerType(ownerId: string) {
    return this.ownerDTOs.find((owner) => owner.id === ownerId)!.type;
  }
}

export default NewTransactionViewModel;
