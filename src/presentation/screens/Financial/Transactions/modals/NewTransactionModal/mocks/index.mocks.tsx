import { router } from "expo-router";
import { Pressable } from "react-native";

import { render } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { DatePicker, Picker } from "@components";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import NewTransactionModal from "../";
import {
  accounts as defaultAccounts,
  categories as defaultCategories,
  owners as defaultOwners,
} from "../../../mocks/index.mocks";
import useForm from "../hooks/useForm";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
}));
jest.mock("@infrastructure/fetcher");
jest.mock("../hooks/useForm");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "create_transaction",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

// region mocks
function field<T>(label: string, value?: T) {
  return { label, onChange: jest.fn(), value };
}

function makeFields(values: Record<string, unknown> = {}) {
  return {
    accountId: field<string>("Account ID", values.accountId as string),
    category: field<string>("Category", values.category as string),
    categoryId: field<string>("Category ID", values.categoryId as string),
    description: field<string>(
      "Description",
      (values.description as string) ?? "",
    ),
    owner: field<string>("Owner", values.owner as string),
    ownerId: field<string>("Owner ID", values.ownerId as string),
    transactionDate: field<Date>(
      "Transaction Date",
      values.transactionDate as Date,
    ),
    type: field<string>("Type", values.type as string),
    value: field<string>("Value", values.value as string),
  };
}

const validateForm = jest.fn();
const addTransaction = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  canGoBack: jest.mocked(router.canGoBack),
  getAccounts: jest.mocked(useCases.getFinancialAccountsUseCase.execute),
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  replace: jest.mocked(router.replace),
  useForm: jest.mocked(useForm),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

interface SetupProps {
  accounts?: AccountDTO[] | undefined;
  categories?: CategoryDTO[] | undefined;
  errors?: Record<string, string>;
  fetching?: "accounts" | "categories" | "owners";
  fieldValues?: Record<string, unknown>;
  owners?: OwnerDTO[] | undefined;
  status?: "idle" | "success";
}

function setup(props: SetupProps = {}) {
  const data = {
    accounts: "accounts" in props ? props.accounts : defaultAccounts,
    categories: "categories" in props ? props.categories : defaultCategories,
    owners: "owners" in props ? props.owners : defaultOwners,
  };
  const fields = makeFields(props.fieldValues);

  spies.useQuery.mockImplementation(((options: { cacheKey: string[] }) => {
    const key = options.cacheKey[0] as keyof typeof data;
    return {
      data: data[key],
      error: null,
      isFetching: props.fetching === key,
      refetch: jest.fn(),
      status: "success",
    };
  }) as never);
  const builtMutation = addTransaction
    .reset()
    .withStatus(props.status ?? "idle")
    .build();
  spies.useMutation.mockReturnValue(builtMutation as never);
  spies.useForm.mockReturnValue({
    errors: props.errors ?? {},
    fields,
    validateForm,
  } as never);

  render(<NewTransactionModal />);

  return { fields, mutate: builtMutation.mutate };
}

const mocks = {
  accounts: defaultAccounts,
  categories: defaultCategories,
  DatePicker,
  owners: defaultOwners,
  Picker,
  Pressable,
  validateForm,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
