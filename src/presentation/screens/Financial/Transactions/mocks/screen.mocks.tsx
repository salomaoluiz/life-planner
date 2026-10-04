import { useIsFocused } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";

import { render } from "@tests";

import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import FinancialTransaction from "../";
import FinancialTransactionViewModel from "../models/FinancialTransactionViewModel";
import { makeTransactionDTO, owners } from "./index.mocks";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useNavigation: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "get_transactions",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
  },
}));
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});
jest.mock("../containers/ListItem", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({
      item,
      refetch,
    }: {
      item: { description: string };
      refetch: () => void;
    }) => (
      <MockView onPress={refetch} testID="listItem" title={item.description} />
    ),
  };
});
jest.mock("../containers/RefetchCache", () => ({
  __esModule: true,
  default: () => null,
}));

// region mocks
const query = new UseQueryFixture<FinancialTransactionViewModel[]>();
const setOptions = jest.fn();

const dtos = [
  makeTransactionDTO({
    date: "2025-03-01T00:00:00Z",
    description: "Later",
    id: "tx-late",
  }),
  makeTransactionDTO({
    date: "2025-01-01T00:00:00Z",
    description: "Earlier",
    id: "tx-early",
  }),
];
// endregion mocks

// region spies
const spies = {
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getTransactions: jest.mocked(
    useCases.getFinancialTransactionsUseCase.execute,
  ),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useNavigation: jest.mocked(useNavigation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.useNavigation.mockReturnValue({ setOptions } as never);
});

function setup(props?: {
  error?: boolean;
  focused?: boolean;
  isFetching?: boolean;
  items?: FinancialTransactionViewModel[];
}) {
  spies.isFocused.mockReturnValue(!!props?.focused);
  query.reset().withIsFetching(!!props?.isFetching);
  if (props?.items) {
    query.withData(props.items);
  }
  if (props?.error) {
    query.withError(new GenericError());
  }
  const built = query.build();
  spies.useQuery.mockReturnValue(built as never);

  render(<FinancialTransaction />);

  return { refetch: built.refetch };
}

const mocks = {
  dtos,
  items: dtos.map((dto) => new FinancialTransactionViewModel(dto, owners)),
  owners,
  setOptions,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
