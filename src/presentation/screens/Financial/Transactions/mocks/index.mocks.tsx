import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO, {
  ITransactionDTO,
} from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

const accounts = [
  new AccountDTO({
    balance: 10,
    icon: "bank",
    id: "acc-1",
    name: "Checking",
    owner: "USER",
    ownerId: "owner-1",
    status: "ACTIVE",
  }),
  new AccountDTO({
    balance: 20,
    icon: "bank",
    id: "acc-2",
    name: "Joint",
    owner: "FAMILY",
    ownerId: "owner-2",
    status: "ACTIVE",
  }),
];

const categories = [
  new CategoryDTO({
    icon: "food",
    id: "cat-1",
    name: "Food",
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
  }),
  new CategoryDTO({
    icon: "home",
    id: "cat-2",
    name: "Rent",
    owner: "FAMILY",
    ownerId: "owner-2",
    type: "EXPENSE",
  }),
];

function makeTransactionDTO(overrides: Partial<ITransactionDTO> = {}) {
  return new TransactionDTO({
    accountId: "acc-1",
    accountName: "Checking",
    category: "cat-1",
    categoryId: "cat-1",
    categoryName: "Food",
    date: "2025-01-10T12:00:00.000Z",
    description: "Groceries",
    id: "tx-1",
    owner: "USER",
    ownerId: "owner-1",
    type: "EXPENSE",
    value: "50.00",
    ...overrides,
  });
}

export { accounts, categories, makeTransactionDTO, owners };
